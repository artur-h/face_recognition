const imageUpload = document.getElementById('imageUpload');

const loadLabeledImages = () => {
  const labels = ['James', 'Jeremy', 'Richard'];

  return Promise.all(labels.map(async (label) => {
    const descriptions = [];

    for (let i = 1; i <= 2; i++) {
      try {
        const img = await faceapi.fetchImage(`https://cors-anywhere.herokuapp.com/https://raw.githubusercontent.com/artur-h/face_recognition/master/labeled-images/${label}/${i}.jpg`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      } catch (e) {
        console.log(e.message);
      }
    }

    return new faceapi.LabeledFaceDescriptors(label, descriptions);
  }));
};

const start = async () => {
  let image;
  let canvas;
  const container = document.createElement('div');
  container.style.position = 'relative';

  document.body.append(container);

  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

  document.body.append('Loaded');

  imageUpload.addEventListener('change', async () => {
    if (image) image.remove();
    if (canvas) canvas.remove();

    image = await faceapi.bufferToImage(imageUpload.files[0]);
    canvas = faceapi.createCanvasFromMedia(image);

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
    const results = resizedDetections.map((detection) => faceMatcher.findBestMatch(detection.descriptor));

    results.forEach((result, index) => {
      const box = resizedDetections[index].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
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
