import { compileTransfers } from '../compile/gtfs';

// CLI used by scripts/refresh.sh and `npm -w api run compile`.
const result = await compileTransfers();
console.log(
  `Wrote ${result.target}: ${result.rows} custom transfer row(s), ${result.bytes} bytes. ` +
    `Run a graph rebuild for OTP to apply them.`,
);
