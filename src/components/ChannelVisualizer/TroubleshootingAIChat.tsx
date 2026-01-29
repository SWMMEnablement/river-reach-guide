import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Send, Loader2, Trash2, ChevronDown, ChevronUp, Stethoscope, Zap, Waves, Clock, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SymptomCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  symptoms: string[];
}

const symptomCategories: SymptomCategory[] = [
  {
    id: 'instability',
    label: 'Numerical Instability',
    icon: <Zap className="w-3 h-3" />,
    symptoms: [
      "Simulation crashes with negative depths",
      "Oscillating water levels at junctions",
      "Mass balance errors exceeding tolerance",
      "Preissmann slot activating unexpectedly",
    ]
  },
  {
    id: 'flow',
    label: 'Flow Issues',
    icon: <Waves className="w-3 h-3" />,
    symptoms: [
      "Flow not reaching downstream nodes",
      "Unexpected flooding at specific locations",
      "Surcharging in pipes that shouldn't surcharge",
      "Backwater effects not propagating correctly",
    ]
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: <Clock className="w-3 h-3" />,
    symptoms: [
      "Simulation running extremely slowly",
      "Model taking too long to initialize",
      "High memory usage during simulation",
      "Timestep being reduced excessively",
    ]
  },
  {
    id: 'results',
    label: 'Unexpected Results',
    icon: <Calculator className="w-3 h-3" />,
    symptoms: [
      "Velocities seem unrealistically high/low",
      "Water surface profiles don't match field data",
      "Rating curve doesn't match observations",
      "Froude numbers indicating wrong flow regime",
    ]
  },
];

const systemPrompt = `You are an expert hydraulic modeling troubleshooter specializing in diagnosing issues with:

1. **InfoWorks ICM** - 1D/2D hydraulic modeling, Preissmann slot, instability, coupling zones
2. **EPA SWMM** - Stormwater modeling, conduit routing, LID controls
3. **HEC-RAS** - River analysis, steady/unsteady flow, bridge/culvert hydraulics
4. **General Hydraulics** - Manning's equation, Froude number, hydraulic jumps, GVF profiles

When diagnosing issues, follow this structured approach:

## Diagnosis Framework
1. **Identify Symptoms**: Understand exactly what the user is observing
2. **Locate the Problem**: Ask about specific nodes, reaches, or time periods
3. **Check Common Causes**: Work through the most likely causes first
4. **Provide Specific Fixes**: Give actionable steps with parameter values

## Common Issues & Quick Checks
- **Negative depths**: Check initial conditions, inflow hydrographs, downstream BC
- **Oscillations**: Reduce timestep, check Courant number, verify Manning's n
- **Mass balance errors**: Check for closed boundaries, verify inflows match
- **Slow performance**: Increase min timestep, reduce 2D mesh density
- **No flow downstream**: Check for adverse slopes, verify conduit connectivity

## Response Format
- Start with the most likely cause
- Provide specific parameter recommendations (e.g., "Try Δt = 1-5 seconds")
- Include diagnostic checks the user can perform
- Reference industry standards when applicable (FHWA, EPA, etc.)

Keep responses focused and actionable. Ask clarifying questions if needed to narrow down the issue.`;

export const TroubleshootingAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hydraulics-chat`;

    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages,
        systemPrompt: systemPrompt 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    return response;
  };

  const handleSubmit = async (questionText?: string) => {
    const messageText = questionText || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await streamChat(newMessages);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                if (updated[updated.length - 1]?.role === 'assistant') {
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                }
                return updated;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                if (updated[updated.length - 1]?.role === 'assistant') {
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                }
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
      });
      setMessages(prev => prev.filter(m => m.content !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedCategory(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSymptomClick = (symptom: string) => {
    handleSubmit(`I'm experiencing this issue: ${symptom}. Can you help me diagnose and fix it?`);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-destructive to-destructive/60 text-destructive-foreground">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              AI Troubleshooting Assistant
              <Badge variant="secondary" className="text-xs">Diagnostic</Badge>
            </h3>
            <p className="text-xs text-muted-foreground">Describe symptoms to get diagnostic guidance for ICM, SWMM, HEC-RAS</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 border-t border-border">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Select a symptom category or describe your issue
                    </p>
                  </div>

                  {/* Category Selection */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {symptomCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selectedCategory === cat.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary hover:bg-secondary/80 text-foreground'
                        }`}
                      >
                        {cat.icon}
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Symptoms for Selected Category */}
                  <AnimatePresence mode="wait">
                    {selectedCategory && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2"
                      >
                        <p className="text-xs text-muted-foreground font-medium text-center">
                          Click a symptom to get diagnostic help:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {symptomCategories
                            .find(c => c.id === selectedCategory)
                            ?.symptoms.map((symptom, i) => (
                              <button
                                key={i}
                                onClick={() => handleSymptomClick(symptom)}
                                className="text-xs px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors text-left flex items-start gap-2"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                {symptom}
                              </button>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!selectedCategory && (
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Or type your own description below
                    </p>
                  )}
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary text-foreground rounded-bl-md'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content || '...'}</div>
                    </div>
                  </motion.div>
                ))
              )}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your modeling issue... e.g., 'My simulation crashes with negative depths at node J15 around timestep 3600'"
                  className="min-h-[44px] max-h-32 resize-none"
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-1">
                  <Button
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-[44px] w-[44px]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                  {messages.length > 0 && (
                    <Button
                      onClick={clearChat}
                      variant="outline"
                      size="icon"
                      className="h-8 w-[44px]"
                      title="Clear chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
