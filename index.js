const path = require('path');
const core = require('@actions/core');
const fs = require('fs');

async function run() {
  try {
    // Get inputs
    const taskDefinitionFile = core.getInput('task-definition', { required: true });
    const containerName = core.getInput('container-name', { required: true });
    const imageURI = core.getInput('image', { required: true });

    // Parse the task definition
    const taskDefPath = path.isAbsolute(taskDefinitionFile) ?
      taskDefinitionFile :
      path.join(process.env.GITHUB_WORKSPACE, taskDefinitionFile);
    if (!fs.existsSync(taskDefPath)) {
      throw new Error(`Task definition file does not exist: ${taskDefinitionFile}`);
    }
    const taskDefContents = require(taskDefPath);

    // Insert the image URI
    if (!Array.isArray(taskDefContents)) {
      throw new Error('Invalid task definition format: containerDefinitions section is not present or is not an array');
    }

    const containerDef = taskDefContents.find(function(element) {
      return element.name == containerName;
    });

    if (!containerDef) {
      throw new Error('Invalid task definition: Could not find container definition with matching name');
    }
    containerDef.image = imageURI;
    
    const newTaskDefContents = JSON.stringify(taskDefContents, null, 2);
    fs.writeFileSync(taskDefPath, newTaskDefContents);
    core.setOutput('task-definition', taskDefPath);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;

/* istanbul ignore next */
if (require.main === module) {
    run();
}
