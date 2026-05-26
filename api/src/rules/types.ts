/**
 * A custom minimum-transfer-buffer rule. Each rule targets a specific transfer
 * point (one or more "alight" stops -> one or more "board" stops) and optionally
 * narrows to specific routes. At compile time it expands into GTFS transfers.txt
 * rows with transfer_type=2 (requires min_transfer_time), which OTP enforces as a
 * constrained transfer in the routing graph.
 */
export interface TransferRule {
  id: number;
  /** Human note, e.g. "weak Utrecht train -> bus 28". */
  label: string;
  /** GTFS stop_ids you alight at (the vehicle you get OFF). */
  fromStopIds: string[];
  /** GTFS stop_ids you board at (the vehicle you get ON). */
  toStopIds: string[];
  /** Narrow to a specific arriving route, or null for "any route". */
  fromRouteId: string | null;
  /** Narrow to a specific departing route, or null for "any route". */
  toRouteId: string | null;
  /** Required minimum buffer between alighting and boarding, in seconds. */
  minBufferSec: number;
  enabled: boolean;
}

/** One row destined for GTFS transfers.txt. All values are strings (CSV). */
export interface TransferRow {
  from_stop_id: string;
  to_stop_id: string;
  from_route_id: string;
  to_route_id: string;
  /** "2" = transfer requires at least min_transfer_time seconds. */
  transfer_type: string;
  min_transfer_time: string;
}
