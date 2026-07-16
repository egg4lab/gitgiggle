# dump_layers.rb
#
# Extract per-layer, per-cell shape usage from a GDS/OASIS layout using
# KLayout batch mode.
#
# Usage:
#   klayout -b -r dump_layers.rb -rd gds=block.gds -rd out=usage.json
#
# Confidentiality note: this script only reads geometry to produce
# layer/cell/bbox statistics. Do not pipe raw GDS or full coordinate
# dumps into an LLM prompt -- only the resulting usage.json / violations.json
# summaries should ever be shared with an AI assistant.

require "json"

raise "missing -rd gds=<path>" unless $gds
raise "missing -rd out=<path>" unless $out

layout = RBA::Layout.new
layout.read($gds)
dbu = layout.dbu

layers = {}

layout.layer_indices.each do |li|
  info = layout.get_info(li)
  key  = "#{info.layer}/#{info.datatype}"
  cell_entries = []

  layout.each_cell do |cell|
    shapes = cell.shapes(li)
    next if shapes.is_empty?

    count = 0
    shapes.each { count += 1 }
    bbox = cell.bbox(li)

    cell_entries << {
      "name"        => cell.name,
      "shape_count" => count,
      "bbox_um"     => [
        (bbox.left   * dbu).round(4),
        (bbox.bottom * dbu).round(4),
        (bbox.right  * dbu).round(4),
        (bbox.top    * dbu).round(4)
      ]
    }
  end

  next if cell_entries.empty?

  layers[key] = {
    "layer_name" => info.name.to_s,
    "cells"      => cell_entries
  }
end

result = {
  "schema_version" => 1,
  "source_file"    => File.basename($gds),
  "dbu"            => dbu,
  "layers"         => layers
}

File.write($out, JSON.pretty_generate(result))
puts "wrote #{$out} (#{layers.size} layer/datatype pairs)"
