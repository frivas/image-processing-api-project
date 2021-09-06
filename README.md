# Project Specification

### Comments

- The backend is inside the `api` folder.
- The scripts available are:
  - `npm run test` it will transpire and then execute jasmine.
  - `npm run perfect` it will execute prettier and lint.
  - `npm run compile` it will transpile the code using `tsc`.
  - `npm run build` it will clean the `dist/` folder, execute the `perfect`, `compile` and `copy-assets` scripts.
  - `npm run start` it will start `nodemon`.

- Once I added a script to copy the views to the `dist` folder I started to notice that `tsc` started to copy the entire `src` folder to the `dist` directory and that was causing that I couldn't run `node dist/` command successfully. I just added the folder where the `copyAssets.ts` file was to the `exclude` list folder and that solved the issue.
- 

## Image Processing API

### Setup and Architecture

#### Set up a project structure that promotes scalability

- [ ] Source code is kept separate from compiled code.
- [ ] All tests should be contained in their own folder.
- [ ] Separate modules are created for any processing.

#### Set up an npm project

- [ ] Package.json should contain both devDependencies, and dependencies.
- [ ] Scripts should be created for testing, linting/prettier, starting the server, and compiling TS.
- [ ] Build script should run without error. 



### Functionality

#### Add and use Express to a node.js project

- [ ] Start script should run without error.
- [ ] Provided endpoint should open in the browser with status 200.

#### Follow middleware documentation to use middleware to create an API

- [ ] Accessing the provided URL with image information should  successfully resize an image and save it to disk on first access, then  pull from disk on subsequent access attempts.
- [ ] An error message should be provided to the user when an image has failed to process or does not exist.



### Code Quality

#### Write relevant unit tests with Jasmine and SuperTest to improve code quality and refactoring

- [ ] Test script runs and all tests created pass. 
- [ ] There is at least 1 test per endpoint and at least one test for image processing. 

#### Utilize TypeScript to avoid errors and improve maintainability

- [ ] All code in the SRC folder should use the .ts filetype.
- [ ] Functions should include typed parameters and return types and not use the `any` type.
- [ ] Import and Export used for modules.
- [ ] Build script should successfully compile TS to JS.

#### Write well-formatted linted code

- [ ] Prettier and Lint scripts should run without producing any error messages.
- [ ] An error message should be provided to the user when an image has failed to process or does not exist.



## Suggestions to Make Your Project Stand Out!

- [x] Add additional processing to accept and output other image formats than JPG.
- [x] Modify the thumbnail filename to include the image size to allow for multiple sizes of the same image.
- [ ] Further explore the options in the Sharp module and add additional processing options.
- [ ] Add in logging to record when images are processed or accessed.
- [ ] Create a front-end for uploading more images to the full-size directory.
- [ ] Create a front-end that displays a thumbnail directory.
- [ ] Create a front-end that allows for the selection of how to process a selected image.