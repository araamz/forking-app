# The Forking-App!
This project was created to be a basis and a guide to Electron for Team #09: WaveBrigade for the Fall 2024-Spring 2025 Academic Year. This one is for you all! 

## Key Takeaways
- **IPC Communication:** IPC Communication is demonstrated between the renderer and main process using preloads. By making the an API that is context-isolated using preloads, a more secure application is achieved (but not perfect!). 
- **Children Processes:** Using IPC Communication and Node's internal APIs for the operating system, spawning and managing children process is demonstrated. However, the implementation is rather crude, a basis is given to be able to save instances of these children processes to be either killed individually or all together (such as during a graceful shutdown of the application).
- **Multi-Window Capability:** In an effort to demonstrate communication beyond the renderer process and main process, a basis for creating multi-window experiences is demonstrated. Specifically, how to plan different routes to be used within different windows and how to move data between each window is demonstrated using Electron's IPC communication tool.
- **Bundling in Electron:** The process of preparing an Electron for building is demonstrated along with several considerations that assist in building the application. Some of these considerations include but not limited to: bundling binaries, preparing the router to operate in both development/production, and ensuring particular access policies are modified to ensure proper functionality. 

# Application Background
The Forking-App is a Electron application composed of two primary systems being the application itself and the Echo Server. The Electron application spawns or kills one or more echo servers in which echo a message. Additionally, the Electron application is capable of communicating individually to these echo servers to update the message assigned to an echo server. The Echo Server script is located under the `echo_server` folder while everything else is for the Forking-App.

## Echo Server Design
The Echo Server is a REST API that features only two endpoints being the following:
- `GET: /`: This endpoint returns a JSON message composed of two keys being `message` and `changed`. `message` is the message held by the echo server and `changed` is a timestamp for when the message was last assigned.
- `POST: /update`: This endpint takes in a JSON message composed of only one key being `message` in which is meant to update the message held by the echo server. Upon successful update to the message, the server returns a JSON message composed of two keys being `message` and `changed`. `message` is the message held by the echo server and `changed` is a timestamp for when the message was last assigned. 

### Technology Stack
- deno
- express
- express-cors

### Building Binaries
The Echo Server application is compiled down to a binary used by the Electron application to spawn instances of the application. Deno is capable of converting machine code to executable binaries. Currently, three tasks are defined in the `deno.json` to allow the binary to work on macOS (arm64 and x86_64) and Windows (x86_64). Building the binaries for each operating system is as follows:
- macOS (arm64): `npm run build:mac`,
- macOS (x86_64): `npm run build:mac`,
- Windows (x86_64): `npm run build:win`

## Fork-App Design

### Technology Stack
- react
- react-router-dom@6

### Primary Operations
- **Starting Electron Application:** This operation invovles instantiation of Electron's app instance.
- **Creating Main Window:**: This operation involves instantiation of a Browser Window object and saving that instance for later usage. 
- **Creating Process Window:**This operation involves creating a 
- **Viewing Echo Server:** 
- **Ending Echo Server Process:**
- **Updating Echo Server Message:**
- **Updating PID List:**
- **Stopping Electron Application:**