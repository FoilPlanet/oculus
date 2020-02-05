# Oculus - Demo Webview for minicap (on android container)

1. Make sure adb connected to device

2. Push minicap executables to remote android

   ```Bash
   ./run-device.sh push
   ```

3. Run minicap on remote

   ```Bash
   ./run-device.sh
   ```

4. Start nodejs application and browse to http://localhost:9002 for a demo.

   ```Bash
   run-node-ws.sh
   ```

See [README](./node-minicap-fp/README.md) for more help.
