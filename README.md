# empireOfAsphalt
Been doing research around a simple city builder type game... tinkering will begin soon!

## Processing models

The voxel models are quite big and if we process them during application loading it is rather slow to start. Therefore we preprocess them into arrays that can be immediately consumed as buffers by WebGL.

We still dynamically load these as their are likely to be a lot by the time we're done and I'd like to show a little loading progress bar as I did in Elite while the assets load.

In any case to process the models run the command:

    npm run process-models

That will load the Voxel-Builder models from the sourceart/buildings folder and create corresponding processed files in the static/voxels folder.