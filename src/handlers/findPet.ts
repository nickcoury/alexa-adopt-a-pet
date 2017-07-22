export default function findPetHandler(request, response) {
  console.log('findPetHandler');

  //https://images.weserv.nl/
  //https://images.weserv.nl/?url=photos.petfinder.com/photos/pets/36879038/1/?bust=1480720144&width=500&-x.jpg

  //https://developer.hootsuite.com/v1.0/docs/https-image-proxy
  //https://d1r1anxoiubeog.cloudfront.net/http%3A%2F%2Fwww.example.com%2Fmyimage%3Fimage%3D%22abcd%22

  response.say(`How about a nice fluffy cat?`);
}
