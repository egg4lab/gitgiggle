# `usage.json` / `violations.json` schema

These are the only two artifacts that should ever be shown to an AI
assistant in this pipeline. Both are already sanitized down to layer
numbers, cell names, shape counts, and bounding boxes in microns -- no raw
GDS geometry or full coordinate dumps.

## `usage.json` (produced by `scripts/dump_layers.rb`)

```json
{
  "schema_version": 1,
  "source_file": "block.gds",
  "dbu": 0.001,
  "layers": {
    "31/0": {
      "layer_name": "M1",
      "cells": [
        {
          "name": "INV_X1",
          "shape_count": 12,
          "bbox_um": [0.0, 0.0, 1.2, 0.8]
        }
      ]
    }
  }
}
```

- `layers` is keyed by `"<layer>/<datatype>"`.
- Only layer/datatype pairs with at least one shape are included.
- `bbox_um` is `[left, bottom, right, top]` in microns, per cell, for that
  layer only (does not include sibling layers).

## `violations.json` (produced by `scripts/check_violations.py`)

```json
{
  "schema_version": 1,
  "node": "nodeX",
  "source_file": "block.gds",
  "baseline_file": "baseline_nodeX.yaml",
  "violation_count": 2,
  "waived_count": 1,
  "violations": [
    {
      "cell": "INV_X1",
      "layer": 63,
      "dt": 0,
      "layer_name": "OLDCAP",
      "shape_count": 4,
      "bbox_um": [10.2, 4.1, 12.6, 5.9],
      "category": "deprecated",
      "rule_violated": "deprecated-layer-usage"
    }
  ]
}
```

`category` is one of:

- `unknown` — the (layer, dt) pair is not defined in the baseline's
  `allowed`, `deprecated`, or `reserved` lists at all. Usually a wrong
  layer/purpose pair or a fat-fingered datatype.
- `deprecated` — a layer that used to be legal but is listed in the
  baseline's `deprecated` section.
- `reserved` — a layer reserved for internal/tool use per the baseline's
  `reserved` section; should never appear in delivered data.

Entries matching a `(cell, layer, dt)` triple in `waivers.yaml` are removed
from `violations` before the file is written and only counted in
`waived_count`.
