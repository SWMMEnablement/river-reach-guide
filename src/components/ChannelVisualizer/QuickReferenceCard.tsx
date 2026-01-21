import { useState } from 'react';
import { Printer, X, Waves, Calculator, AlertTriangle, TreePine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuickReferenceCard = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors print:hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Printer className="w-4 h-4" />
        <span>Quick Reference Card</span>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-black max-w-4xl w-full max-h-[90vh] overflow-auto rounded-xl shadow-2xl print:max-h-none print:overflow-visible print:shadow-none print:rounded-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Print Controls - Hidden when printing */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center print:hidden z-10">
                <h2 className="text-lg font-bold text-gray-900">Hydraulics Quick Reference</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Content */}
              <div className="p-6 print:p-4 space-y-6 print:space-y-4" id="print-content">
                {/* Header */}
                <div className="text-center border-b-2 border-blue-600 pb-4 print:pb-2">
                  <h1 className="text-2xl print:text-xl font-bold text-blue-800">
                    Hydraulics Quick Reference Card
                  </h1>
                  <p className="text-gray-600 text-sm">Open Channel Flow & Modeling Essentials</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 print:gap-4">
                  {/* Fundamental Equations */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Calculator className="w-5 h-5 print:w-4 print:h-4" />
                      <h2 className="font-bold text-lg print:text-base">Key Equations</h2>
                    </div>
                    
                    <div className="space-y-2 text-sm print:text-xs">
                      <div className="bg-blue-50 p-3 print:p-2 rounded-lg border-l-4 border-blue-500">
                        <p className="font-semibold text-blue-800">Manning's Equation</p>
                        <p className="font-mono text-gray-800">Q = (1/n) × A × R^(2/3) × S^(1/2)</p>
                        <p className="text-gray-600 mt-1">Where: Q=discharge, n=roughness, A=area, R=hydraulic radius, S=slope</p>
                      </div>

                      <div className="bg-blue-50 p-3 print:p-2 rounded-lg border-l-4 border-blue-500">
                        <p className="font-semibold text-blue-800">Froude Number</p>
                        <p className="font-mono text-gray-800">Fr = V / √(g × D)</p>
                        <p className="text-gray-600 mt-1">Fr&lt;1: Subcritical | Fr=1: Critical | Fr&gt;1: Supercritical</p>
                      </div>

                      <div className="bg-blue-50 p-3 print:p-2 rounded-lg border-l-4 border-blue-500">
                        <p className="font-semibold text-blue-800">Conveyance</p>
                        <p className="font-mono text-gray-800">K = (1/n) × A × R^(2/3)</p>
                        <p className="text-gray-600 mt-1">Q = K × √S (combines geometry & roughness)</p>
                      </div>

                      <div className="bg-blue-50 p-3 print:p-2 rounded-lg border-l-4 border-blue-500">
                        <p className="font-semibold text-blue-800">Specific Energy</p>
                        <p className="font-mono text-gray-800">E = y + V²/(2g) = y + Q²/(2gA²)</p>
                        <p className="text-gray-600 mt-1">Minimum E occurs at critical depth</p>
                      </div>

                      <div className="bg-blue-50 p-3 print:p-2 rounded-lg border-l-4 border-blue-500">
                        <p className="font-semibold text-blue-800">Weir Equation</p>
                        <p className="font-mono text-gray-800">Q = C × L × H^(3/2)</p>
                        <p className="text-gray-600 mt-1">C≈1.84 (sharp), C≈1.7 (broad-crested)</p>
                      </div>

                      <div className="bg-blue-50 p-3 print:p-2 rounded-lg border-l-4 border-blue-500">
                        <p className="font-semibold text-blue-800">Orifice Equation</p>
                        <p className="font-mono text-gray-800">Q = Cd × A × √(2gh)</p>
                        <p className="text-gray-600 mt-1">Cd≈0.6 (sharp edge), Cd≈0.8 (rounded)</p>
                      </div>
                    </div>
                  </section>

                  {/* Manning's n Values */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <TreePine className="w-5 h-5 print:w-4 print:h-4" />
                      <h2 className="font-bold text-lg print:text-base">Manning's n Values</h2>
                    </div>
                    
                    <div className="text-sm print:text-xs">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-green-100">
                            <th className="border border-green-300 px-2 py-1 text-left text-green-800">Surface Type</th>
                            <th className="border border-green-300 px-2 py-1 text-center text-green-800">n Range</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-800">
                          <tr className="bg-green-50">
                            <td colSpan={2} className="border border-green-200 px-2 py-1 font-semibold text-green-700">Closed Conduits</td>
                          </tr>
                          <tr><td className="border border-green-200 px-2 py-1">Concrete (smooth)</td><td className="border border-green-200 px-2 py-1 text-center font-mono">0.011-0.015</td></tr>
                          <tr><td className="border border-green-200 px-2 py-1">Corrugated Metal</td><td className="border border-green-200 px-2 py-1 text-center font-mono">0.022-0.026</td></tr>
                          <tr><td className="border border-green-200 px-2 py-1">PVC/HDPE</td><td className="border border-green-200 px-2 py-1 text-center font-mono">0.009-0.012</td></tr>
                          
                          <tr className="bg-green-50">
                            <td colSpan={2} className="border border-green-200 px-2 py-1 font-semibold text-green-700">Open Channels</td>
                          </tr>
                          <tr><td className="border border-green-200 px-2 py-1">Concrete lined</td><td className="border border-green-200 px-2 py-1 text-center font-mono">0.013-0.017</td></tr>
                          <tr><td className="border border-green-200 px-2 py-1">Earth (clean)</td><td className="border border-green-200 px-2 py-1 text-center font-mono">0.018-0.025</td></tr>
                          <tr><td className="border border-green-200 px-2 py-1">Gravel bed</td><td className="border border-green-200 px-2 py-1 text-center font-mono">0.025-0.035</td></tr>
                          <tr><td className="border border-green-200 px-2 py-1">Natural stream</td><td className="border border-green-200 px-2 py-1 text-center font-mono">0.030-0.050</td></tr>
                          <tr><td className="border border-green-200 px-2 py-1">Weedy/overgrown</td><td className="border border-green-200 px-2 py-1 text-center font-mono">0.050-0.080</td></tr>
                          
                          <tr className="bg-green-50">
                            <td colSpan={2} className="border border-green-200 px-2 py-1 font-semibold text-green-700">Floodplains</td>
                          </tr>
                          <tr><td className="border border-green-200 px-2 py-1">Short grass</td><td className="border border-green-200 px-2 py-1 text-center font-mono">0.030-0.040</td></tr>
                          <tr><td className="border border-green-200 px-2 py-1">Light brush</td><td className="border border-green-200 px-2 py-1 text-center font-mono">0.050-0.070</td></tr>
                          <tr><td className="border border-green-200 px-2 py-1">Heavy timber</td><td className="border border-green-200 px-2 py-1 text-center font-mono">0.100-0.160</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Flow Profile Types */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-purple-700">
                      <Waves className="w-5 h-5 print:w-4 print:h-4" />
                      <h2 className="font-bold text-lg print:text-base">GVF Profile Types</h2>
                    </div>
                    
                    <div className="text-sm print:text-xs space-y-2">
                      <div className="bg-purple-50 p-2 rounded border-l-4 border-purple-400">
                        <p className="font-semibold text-purple-800">Mild Slope (yn &gt; yc)</p>
                        <ul className="text-gray-700 ml-4 list-disc">
                          <li><strong>M1:</strong> y &gt; yn → backwater, approaches yn</li>
                          <li><strong>M2:</strong> yc &lt; y &lt; yn → drawdown to yc</li>
                          <li><strong>M3:</strong> y &lt; yc → rising toward jump</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 p-2 rounded border-l-4 border-purple-400">
                        <p className="font-semibold text-purple-800">Steep Slope (yn &lt; yc)</p>
                        <ul className="text-gray-700 ml-4 list-disc">
                          <li><strong>S1:</strong> y &gt; yc → backwater above yc</li>
                          <li><strong>S2:</strong> yn &lt; y &lt; yc → drawdown to yn</li>
                          <li><strong>S3:</strong> y &lt; yn → rising toward yn</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 p-2 rounded border-l-4 border-purple-400">
                        <p className="font-semibold text-purple-800">Critical Slope (yn = yc)</p>
                        <p className="text-gray-700 ml-4">C1, C3: Rare, unstable profiles</p>
                      </div>
                    </div>
                  </section>

                  {/* Troubleshooting */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-5 h-5 print:w-4 print:h-4" />
                      <h2 className="font-bold text-lg print:text-base">Troubleshooting Tips</h2>
                    </div>
                    
                    <div className="text-sm print:text-xs space-y-2">
                      <div className="bg-red-50 p-2 rounded border-l-4 border-red-400">
                        <p className="font-semibold text-red-800">Numerical Oscillations</p>
                        <ul className="text-gray-700 ml-4 list-disc">
                          <li>Reduce timestep (Courant &lt; 1)</li>
                          <li>Increase Theta (θ) toward 1.0</li>
                          <li>Check for abrupt geometry changes</li>
                        </ul>
                      </div>
                      <div className="bg-red-50 p-2 rounded border-l-4 border-red-400">
                        <p className="font-semibold text-red-800">Mass Balance Errors (&gt;1%)</p>
                        <ul className="text-gray-700 ml-4 list-disc">
                          <li>Check boundary conditions</li>
                          <li>Verify all inflows/outflows defined</li>
                          <li>Reduce timestep size</li>
                        </ul>
                      </div>
                      <div className="bg-red-50 p-2 rounded border-l-4 border-red-400">
                        <p className="font-semibold text-red-800">Solver Not Converging</p>
                        <ul className="text-gray-700 ml-4 list-disc">
                          <li>Increase iterations (20→50)</li>
                          <li>Use smaller timesteps</li>
                          <li>Check for dry/wet cycling</li>
                        </ul>
                      </div>
                      <div className="bg-red-50 p-2 rounded border-l-4 border-red-400">
                        <p className="font-semibold text-red-800">Surcharging Issues</p>
                        <ul className="text-gray-700 ml-4 list-disc">
                          <li>Verify pipe inverts/crowns</li>
                          <li>Check junction spill crest</li>
                          <li>Enable Preissmann slot</li>
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Quick Formulas Footer */}
                <div className="border-t-2 border-gray-300 pt-4 print:pt-2 mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-3 text-xs print:text-[10px]">
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <p className="font-semibold text-gray-700">Hydraulic Radius</p>
                      <p className="font-mono text-gray-600">R = A / P</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <p className="font-semibold text-gray-700">Hydraulic Depth</p>
                      <p className="font-mono text-gray-600">D = A / T</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <p className="font-semibold text-gray-700">Courant Number</p>
                      <p className="font-mono text-gray-600">C = (V+c)Δt/Δx</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <p className="font-semibold text-gray-700">Wave Celerity</p>
                      <p className="font-mono text-gray-600">c = √(gD)</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-200">
                  <p>River Reach Guide • Hydraulics Quick Reference • For educational purposes</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content, #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </>
  );
};
