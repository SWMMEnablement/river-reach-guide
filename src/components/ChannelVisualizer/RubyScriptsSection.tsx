import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Check, Terminal, Database, Settings, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ScriptExample {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  code: string;
  notes: string[];
}

const scripts: ScriptExample[] = [
  {
    id: 'mannings-n',
    title: "Adjust Manning's n Along Reach",
    description: "Programmatically modify roughness coefficients for river sections based on chainage or other criteria.",
    icon: <Settings className="w-5 h-5" />,
    code: `# ICM Ruby Script: Adjust Manning's n Along a River Reach
# This script modifies roughness coefficients based on chainage

# Access the current network
net = WSApplication.current_network

# Define roughness zones by chainage ranges
roughness_zones = {
  [0, 500] => 0.035,      # Natural channel - upstream
  [500, 1200] => 0.025,   # Concrete lined section
  [1200, 1800] => 0.040,  # Vegetated floodplain
  [1800, 2500] => 0.032   # Mixed substrate - downstream
}

# Track changes for logging
changes_made = 0

# Iterate through all river reach objects
net.row_objects('hw_river_reach').each do |reach|
  chainage = reach.us_chainage  # Upstream chainage
  
  # Find matching roughness zone
  roughness_zones.each do |range, manning_n|
    if chainage >= range[0] && chainage < range[1]
      old_n = reach.bottom_roughness
      reach.bottom_roughness = manning_n
      reach.bank_roughness = manning_n * 1.1  # Banks slightly rougher
      
      puts "Reach #{reach.id}: n changed from #{old_n} to #{manning_n}"
      changes_made += 1
      break
    end
  end
end

# Commit changes to the network
net.transaction_commit
puts "\\nTotal reaches modified: #{changes_made}"`,
    notes: [
      "Run from ICM GeoPlan: Network → Ruby Scripts → Run Script",
      "Always backup your network before running modification scripts",
      "Use transaction_commit to save changes permanently",
      "Bank roughness is typically 10-20% higher than bed roughness"
    ]
  },
  {
    id: 'extract-results',
    title: "Extract Results at Multiple Chainages",
    description: "Query simulation results at specific chainage points and export to CSV for analysis.",
    icon: <Database className="w-5 h-5" />,
    code: `# ICM Ruby Script: Extract Results at Multiple Chainage Points
# Exports water levels, velocities, and flows to CSV

require 'csv'

# Access the current network and results
net = WSApplication.current_network
sim = net.current_timestep_results

# Define chainage points of interest
chainage_points = [0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000]

# Output file path
output_file = "C:/ICM_Results/reach_results_#{Time.now.strftime('%Y%m%d_%H%M%S')}.csv"

# Collect results data
results_data = []

chainage_points.each do |target_chainage|
  # Find nearest river reach to target chainage
  nearest_reach = nil
  min_distance = Float::INFINITY
  
  net.row_objects('hw_river_reach').each do |reach|
    distance = (reach.us_chainage - target_chainage).abs
    if distance < min_distance
      min_distance = distance
      nearest_reach = reach
    end
  end
  
  if nearest_reach
    # Extract hydraulic results
    result = {
      chainage: target_chainage,
      actual_chainage: nearest_reach.us_chainage,
      reach_id: nearest_reach.id,
      water_level: sim.river_reach_depth(nearest_reach.id),
      velocity: sim.river_reach_velocity(nearest_reach.id),
      flow: sim.river_reach_flow(nearest_reach.id),
      froude: sim.river_reach_froude(nearest_reach.id),
      wetted_area: sim.river_reach_xsarea(nearest_reach.id)
    }
    results_data << result
  end
end

# Write to CSV
CSV.open(output_file, 'w') do |csv|
  csv << ['Target Chainage (m)', 'Actual Chainage (m)', 'Reach ID', 
          'Depth (m)', 'Velocity (m/s)', 'Flow (m³/s)', 
          'Froude Number', 'Wetted Area (m²)']
  
  results_data.each do |r|
    csv << [r[:chainage], r[:actual_chainage], r[:reach_id],
            r[:water_level]&.round(3), r[:velocity]&.round(3), 
            r[:flow]&.round(3), r[:froude]&.round(3), r[:wetted_area]&.round(3)]
  end
end

puts "Results exported to: #{output_file}"
puts "Total points extracted: #{results_data.length}"`,
    notes: [
      "Requires an active simulation with results loaded",
      "Modify output_file path to your preferred location",
      "Results are interpolated to nearest cross-section",
      "Add more result types as needed (shear stress, conveyance, etc.)"
    ]
  },
  {
    id: 'time-series',
    title: "Extract Time Series at Node",
    description: "Export complete time series data for a specific node or reach throughout a simulation.",
    icon: <FileText className="w-5 h-5" />,
    code: `# ICM Ruby Script: Extract Time Series at Specific Location
# Exports complete simulation timeline for analysis

require 'csv'

# Configuration
target_reach_id = "REACH_001"  # Change to your reach ID
output_file = "C:/ICM_Results/timeseries_#{target_reach_id}.csv"

# Access network and simulation
net = WSApplication.current_network
sim_list = net.list_timestep_results

puts "Found #{sim_list.length} timesteps in simulation"

# Storage for time series data
time_series = []

# Iterate through all timesteps
sim_list.each_with_index do |timestep, index|
  # Load timestep results
  net.load_timestep_results(timestep)
  sim = net.current_timestep_results
  
  # Extract data at target reach
  data_point = {
    timestep: index,
    time_hours: timestep / 3600.0,  # Convert seconds to hours
    depth: sim.river_reach_depth(target_reach_id),
    velocity: sim.river_reach_velocity(target_reach_id),
    flow: sim.river_reach_flow(target_reach_id),
    froude: sim.river_reach_froude(target_reach_id),
    regime: sim.river_reach_flow(target_reach_id) > 0 ? 
            (sim.river_reach_froude(target_reach_id) > 1 ? 'Supercritical' : 'Subcritical') : 
            'No Flow'
  }
  
  time_series << data_point
  
  # Progress indicator
  print "\\rProcessing timestep #{index + 1}/#{sim_list.length}"
end

puts "\\nWriting CSV file..."

# Export to CSV
CSV.open(output_file, 'w') do |csv|
  csv << ['Timestep', 'Time (hours)', 'Depth (m)', 'Velocity (m/s)', 
          'Flow (m³/s)', 'Froude Number', 'Flow Regime']
  
  time_series.each do |t|
    csv << [t[:timestep], t[:time_hours].round(2), 
            t[:depth]&.round(3), t[:velocity]&.round(3),
            t[:flow]&.round(3), t[:froude]&.round(3), t[:regime]]
  end
end

puts "Time series exported: #{output_file}"
puts "Total timesteps: #{time_series.length}"`,
    notes: [
      "Processing many timesteps can be slow - be patient",
      "Results include flow regime classification",
      "Useful for generating hydrographs and stage time series",
      "Can be extended to extract multiple locations simultaneously"
    ]
  },
  {
    id: 'batch-modify',
    title: "Batch Modify Cross-Section Properties",
    description: "Update multiple cross-section properties based on survey data or calibration requirements.",
    icon: <Terminal className="w-5 h-5" />,
    code: `# ICM Ruby Script: Batch Modify Cross-Section Properties
# Updates geometry and roughness based on external data

# Access the current network
net = WSApplication.current_network

# Calibration factors (adjust based on calibration results)
calibration = {
  roughness_factor: 1.15,     # Multiply all n values by this
  depth_adjustment: 0.10,     # Add to all invert levels (m)
  width_factor: 1.0           # Scale bottom widths
}

# Optional: Target specific reaches by ID pattern
target_pattern = /^REACH_/    # Regex to match reach IDs

# Track modifications
modified_count = 0
skipped_count = 0

net.row_objects('hw_river_reach').each do |reach|
  # Check if reach matches target pattern
  unless reach.id.match?(target_pattern)
    skipped_count += 1
    next
  end
  
  # Apply roughness calibration
  original_n = reach.bottom_roughness
  reach.bottom_roughness = (original_n * calibration[:roughness_factor]).round(4)
  reach.bank_roughness = (reach.bank_roughness * calibration[:roughness_factor]).round(4)
  
  # Apply invert adjustment
  reach.us_invert = reach.us_invert + calibration[:depth_adjustment]
  reach.ds_invert = reach.ds_invert + calibration[:depth_adjustment]
  
  # Apply width scaling
  if reach.respond_to?(:bottom_width) && reach.bottom_width
    reach.bottom_width = (reach.bottom_width * calibration[:width_factor]).round(3)
  end
  
  puts "Modified #{reach.id}: n=#{reach.bottom_roughness}, invert+#{calibration[:depth_adjustment]}m"
  modified_count += 1
end

# Commit all changes
net.transaction_commit

puts "\\n" + "="*50
puts "Batch modification complete"
puts "Modified: #{modified_count} reaches"
puts "Skipped: #{skipped_count} reaches"
puts "="*50

# Validation check
puts "\\nValidation: Check for negative slopes..."
net.row_objects('hw_river_reach').each do |reach|
  if reach.us_invert < reach.ds_invert
    puts "WARNING: Adverse slope at #{reach.id}"
  end
end`,
    notes: [
      "Use regex patterns to target specific reach groups",
      "Always validate results after batch modifications",
      "Keep calibration factors close to 1.0 for physical realism",
      "Script includes adverse slope warning for QA/QC"
    ]
  }
];

const RubyScriptsSection: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 p-6 bg-card rounded-xl border border-border"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Code className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">ICM Ruby Scripts</h3>
          <p className="text-sm text-muted-foreground">
            Automate common tasks with these ready-to-use scripts
          </p>
        </div>
      </div>

      <Tabs defaultValue="mannings-n" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-1 h-auto p-1 mb-6">
          {scripts.map((script) => (
            <TabsTrigger
              key={script.id}
              value={script.id}
              className="flex items-center gap-2 text-xs md:text-sm py-2 px-3"
            >
              {script.icon}
              <span className="hidden sm:inline">{script.title.split(' ').slice(0, 2).join(' ')}</span>
              <span className="sm:hidden">{script.title.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {scripts.map((script) => (
          <TabsContent key={script.id} value={script.id} className="mt-0">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-foreground">{script.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{script.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(script.code, script.id)}
                  className="flex items-center gap-2 shrink-0"
                >
                  {copiedId === script.id ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <pre className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto text-xs md:text-sm font-mono text-foreground leading-relaxed max-h-[400px] overflow-y-auto">
                  <code>{script.code}</code>
                </pre>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  Usage Notes
                </h5>
                <ul className="space-y-1">
                  {script.notes.map((note, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
        <h5 className="font-medium text-foreground mb-2">Running Ruby Scripts in ICM</h5>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Open your network in ICM GeoPlan</li>
          <li>Navigate to <span className="font-mono bg-muted px-1 rounded">Network → Ruby Scripts → Run Script</span></li>
          <li>Paste the script or load from file</li>
          <li>Click Run and monitor the output console</li>
          <li>Review changes before committing to the database</li>
        </ol>
      </div>
    </motion.div>
  );
};

export default RubyScriptsSection;
