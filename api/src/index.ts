import * as http from 'http';
import App from './app';

const port = 5000;

App.set('port', port);
const server = http.createServer(App);
server.listen(port);

server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
  console.log(`Listening on ${bind}`);
});

export default App;
