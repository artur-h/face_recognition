const imageUpload = document.getElementById('imageUpload');

const loadLabeledImages = () => {
  const labels = ['James', 'Jeremy', 'Richard'];

  return Promise.all(labels.map(async (label) => {

  }));
};

const start = () => {
  const container = document.createElement('div');
  container.style.position = 'relative';

  document.body.append(container);
  document.body.append('Loaded');

  imageUpload.addEventListener('change', async () => {
    // saving uploaded image to work with faceapi
    const image = await faceapi.bufferToImage(imageUpload.files[0]);
    const canvas = faceapi.createCanvasFromMedia(image);
    const displaySize = {
      width: image.width,
      height: image.height,
    };

    container.append(image);
    container.append(canvas);

    faceapi.matchDimensions(canvas, displaySize);

    // withFaceLandmarks allows to detect where different faces are. withFaceDescriptors allows to draw a box around the face
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    resizedDetections.forEach((detection) => {
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, { label: 'Face' });
      drawBox.draw(canvas);
    })
  });
};

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),

// allows to detect where actual characters' faces are so we can use recognition to find out which of faces which
faceapi.nets.faceLandmark68Net.loadFromUri('./models'),

// detection algorithm
faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
]).then(start);
