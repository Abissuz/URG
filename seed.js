// seed.js - VERSIÓN ACTUALIZADA CON PORTADAS

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import serviceAccount from './unimar-radio-global-firebase-adminsdk-fbsvc-efa6e925a9.json' assert { type: 'json' }

initializeApp({
  credential: cert(serviceAccount),
})

const db = getFirestore()

// --- Lista de canciones con el nuevo campo 'coverImage' ---
const songs = [
  {
    artist: 'Queen',
    title: 'Bohemian Rhapsody',
    duration: '5:55',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png',
  },
  {
    artist: 'Michael Jackson',
    title: 'Billie Jean',
    duration: '4:54',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/9/95/Michael_Jackson_-_Billie_Jean.png',
  },
  {
    artist: 'Nirvana',
    title: 'Smells Like Teen Spirit',
    duration: '5:01',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/3/3c/Smells_Like_Teen_Spirit.jpeg',
  },
  {
    artist: 'The Beatles',
    title: 'Hey Jude',
    duration: '7:11',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/0/0a/Heyjude_single.png',
  },
  {
    artist: 'Led Zeppelin',
    title: 'Stairway to Heaven',
    duration: '8:02',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Led_Zeppelin_-_Led_Zeppelin_IV.jpg/220px-Led_Zeppelin_-_Led_Zeppelin_IV.jpg',
  },
  {
    artist: 'The Eagles',
    title: 'Hotel California',
    duration: '6:30',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg',
  },
  {
    artist: 'Soda Stereo',
    title: 'De Música Ligera',
    duration: '3:33',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Soda_Stereo_-_Cancion_Animal.jpeg/220px-Soda_Stereo_-_Cancion_Animal.jpeg',
  },
  {
    artist: 'Maná',
    title: 'Rayando el Sol',
    duration: '4:10',
    coverImage: 'https://i.scdn.co/image/ab67616d0000b273462b662363013cf445984c7c',
  },
  {
    artist: 'Shakira',
    title: "Hips Don't Lie",
    duration: '3:38',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Shakira_-_Hips_Don%27t_Lie.png/220px-Shakira_-_Hips_Don%27t_Lie.png',
  },
  {
    artist: 'Daft Punk',
    title: 'Get Lucky',
    duration: '6:09',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Daft_Punk_-_Get_Lucky.jpg',
  },
  {
    artist: 'Adele',
    title: 'Rolling in the Deep',
    duration: '3:48',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Rolling_in_the_Deep_Adele.png/220px-Rolling_in_the_Deep_Adele.png',
  },
  {
    artist: 'Bob Marley',
    title: 'No Woman, No Cry',
    duration: '7:07',
    coverImage: 'https://i.scdn.co/image/ab67616d0000b273e9d893562649ba32a7442387',
  },
  {
    artist: 'AC/DC',
    title: 'Back in Black',
    duration: '4:15',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/ACDC_Back_in_Black_cover.svg/220px-ACDC_Back_in_Black_cover.svg.png',
  },
  {
    artist: "Guns N' Roses",
    title: "Sweet Child O' Mine",
    duration: '5:56',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Guns_N%27_Roses_-_Appetite_for_Destruction.png/220px-Guns_N%27_Roses_-_Appetite_for_Destruction.png',
  },
  {
    artist: 'U2',
    title: 'With or Without You',
    duration: '4:56',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/U2WithOrWithoutYou.jpg/220px-U2WithOrWithoutYou.jpg',
  },
  {
    artist: 'Red Hot Chili Peppers',
    title: 'Californication',
    duration: '5:21',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/d/df/RedHotChiliPeppersCalifornication.jpg',
  },
  {
    artist: 'Coldplay',
    title: 'Viva La Vida',
    duration: '4:01',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/thumb/0/01/Viva_la_Vida_or_Death_and_All_His_Friends.jpg/220px-Viva_la_Vida_or_Death_and_All_His_Friends.jpg',
  },
  {
    artist: 'Oasis',
    title: 'Wonderwall',
    duration: '4:18',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/b/b6/%28What%27s_the_Story%29_Morning_Glory%3F.png',
  },
  {
    artist: 'Metallica',
    title: 'Enter Sandman',
    duration: '5:31',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/2/2c/Metallica_-_Metallica_cover.jpg',
  },
  {
    artist: 'Radiohead',
    title: 'Creep',
    duration: '3:59',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/thumb/6/65/Radiohead.creep.png/220px-Radiohead.creep.png',
  },
  {
    artist: 'Juanes',
    title: 'A Dios le Pido',
    duration: '3:25',
    coverImage: 'https://i.scdn.co/image/ab67616d0000b2735749a21535459385b349479b',
  },
  {
    artist: 'Caramelos de Cianuro',
    title: 'Verónica',
    duration: '3:15',
    coverImage: 'https://i.scdn.co/image/ab67616d0000b27303e990c79314419b36214227',
  },
  {
    artist: 'Zapato 3',
    title: 'Pantaletas Negras',
    duration: '4:50',
    coverImage: 'https://i.scdn.co/image/ab67616d0000b273400d76e625a371c6060f64c1',
  },
  {
    artist: 'Los Amigos Invisibles',
    title: 'Mentiras',
    duration: '4:05',
    coverImage: 'https://i.scdn.co/image/ab67616d0000b273295960682243d4c7949318b7',
  },
  {
    artist: 'The Weeknd',
    title: 'Blinding Lights',
    duration: '3:20',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_Blinding_Lights.png',
  },
  {
    artist: 'Billie Eilish',
    title: 'bad guy',
    duration: '3:14',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/2/2a/Billie_Eilish_-_Bad_Guy.png',
  },
  {
    artist: 'Ed Sheeran',
    title: 'Shape of You',
    duration: '3:53',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/b/b4/Shape_Of_You_%28Official_Single_Cover%29_by_Ed_Sheeran.png',
  },
  {
    artist: 'Bruno Mars',
    title: 'Uptown Funk',
    duration: '4:30',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/b/b1/Mark_Ronson_-_Uptown_Funk_-_Single_Cover.png',
  },
  {
    artist: 'Pharrell Williams',
    title: 'Happy',
    duration: '3:52',
    coverImage:
      'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Pharrell_Williams_-_Happy.jpg/220px-Pharrell_Williams_-_Happy.jpg',
  },
  {
    artist: 'Taylor Swift',
    title: 'Shake It Off',
    duration: '3:39',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Taylor_Swift_-_Shake_It_Off.png',
  },
]

async function seedDatabase() {
  console.log('Iniciando siembra de canciones con portadas...')
  const songsCollection = db.collection('songs')
  const promises = songs.map((song) => songsCollection.add(song))

  try {
    await Promise.all(promises)
    console.log(`¡Siembra de ${songs.length} canciones completada con éxito!`)
  } catch (error) {
    console.error('Error durante la siembra:', error)
  }
}

seedDatabase()
