import * as shell from 'shelljs';

shell.cp('-R', 'src/tests/files', 'dist/tests');
shell.cp('-R', 'assets', 'dist');
