import React, { useEffect, useState } from 'react'
import logo from './logo.svg';
import './App.css';
import { fireStore, loginConGoogle, auth, logout } from './firebase/firebase';
import logobig from './imgs/logobig.svg'
import logogoogle from './imgs/logogoogle.png'
import logoutlogo from './imgs/logout.svg'
import like from './imgs/like.svg'
import trash from './imgs/trash.svg'
import 'bootstrap/dist/css/bootstrap.min.css'
import Spinner from './components/Spinner';


export default function App() {


  const [data, setData] = useState([])
  const [isSearch, setIsSearch] = useState(false);
  const [user, setUser] = useState(null);
  const [favs, setFavs] = useState([]);
  const [view, setView] = useState("feed");
  const [tweet, setTweet] = useState({
    tweet: "",
    username: "",
    uid: "",
    mail: "",
    photo: "",
    likes: 0,
  });


  useEffect(() => {

    setIsSearch(true);

    const desuscribir = fireStore.collection('tweets')
      .orderBy('date')
      .onSnapshot((snapshot) => {
        const docs = []
        snapshot.forEach(doc => {

          const snap = {
            username: doc.data().username,
            tweet: doc.data().tweet,
            id: doc.id,
            likes: doc.data().likes,
            email: doc.data().email,
            uid: doc.data().uid,
            photo: doc.data().photo,
            date: doc.data().date
          };

          docs.unshift(snap)

        })

        setData(docs)

        setIsSearch(false)



      });

    auth.onAuthStateChanged((user) => {
      setUser(user)

      if (user) {
        fireStore.collection('users').get()
          .then(snapshot => {
            snapshot.forEach(doc => {

              const userDoc = doc.data()
              if (userDoc.uid === user.uid) {
                setUser({
                  ...user, ...userDoc
                })

              }

            })
          })
      }
    });

    return () => {
      desuscribir()
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (data.length && user.favorites && user.favorites.length) {
        const favorites = user.favorites.map(favId => {
          const tweetFav = data.find(item => item.id === favId)

          return tweetFav

        })
          .filter(item => item !== undefined)
        setFavs(favorites)

      }

      const fileUser = fireStore.collection('users').where("uid", "==", user.uid).get()
      fileUser.then((res) => {
        // console.log('query', res.empty)
        // si el usuario con campo uid NO existe en la collection "users", empty === true
        // si el usuario con campo uid SI existe en la collection "users", empty === false

        if (res.empty) {
          fireStore.collection('users').add({
            uid: user.uid,
            name: user.displayName,
            photo: user.photoURL,
            email: user.email,
            favorites: []
          });
        }



      })

      // fireStore.collection("users")
      //   .get()
      //   .then(snapshot => {

      //     if (!snapshot.size) {
      //       return fireStore.collection('users').add({
      //         displayName: user.displayName,
      //         photo: user.photoURL,
      //         uid: user.uid,
      //         email: user.email,
      //         favorites: []
      //       })
      //     } else {
      //       snapshot.forEach(doc => {

      //         const userDoc = doc.data()

      //         // Agrega solo usuarios nuevos

      //         if (userDoc.uid !== user.uid) {

      //           return fireStore.collection('users').add({
      //             displayName: user.displayName,
      //             photo: user.photoURL,
      //             uid: user.uid,
      //             email: user.email,
      //             favorites: []
      //           })
      //         }
      //       })
      //     }

      //   })
      //   .then(doc => doc.get())
      //   .then(userDoc => {
      //     setUser(userDoc)


      //   })
    }
  }, [user, data])

  // const handleUsernameChange = (e) => {
  //   let newTweet = {
  //     ...tweet,
  //     username: e.target.value
  //   };
  //   setTweet(newTweet)
  // };

  // const handleTweetChange = (e) => {

  //   let newTweet = {
  //     tweet: e.target.value,
  //     ...tweet
  //   };
  //   setTweet(newTweet);

  // }




  const handleChange = (e) => {
    let newTweet = {
      tweet: e.target.value,
      uid: user.uid,
      email: user.email,
      username: user.displayName,
      photo: user.photoURL,
      date: Date.now()

    }

    setTweet(newTweet)
  }



  function handleSubmit(e) {
    e.preventDefault()

    const addTweet = fireStore.collection("tweets").add(tweet)
    const getDoc = addTweet.then(doc => (doc.get()))
    getDoc.then(doc => {
      const currentTweet = {
        username: doc.data().displayName,
        tweet: doc.data().tweet,
        id: doc.id,
        uid: doc.data().uid,
        email: doc.data().email,
        likes: doc.data().likes,
        photo: doc.data().photoURL
      }
      setData([currentTweet, ...data])

    })
    setTweet({
      tweet: "",
      username: ""
    })

  }

  function deleteTweet(id) {

    const userConfirm = window.confirm("Estas seguro que quieres eliminar el Tweet?");

    if (userConfirm) {

      const updatedTweets = data.filter((tweet) => {
        return tweet.id !== id
      })

      setData(updatedTweets)
      fireStore.doc(`tweets/${id}`).delete();

    }



  }

  /**
   * 
   * @description function that actualize the likes from database 
   */

  function likeTweet(id, likes) {
    const innerLikes = likes || 0;
    fireStore.doc(`tweets/${id}`).update({ likes: innerLikes + 1 })

    fireStore.collection("users")
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const userDoc = doc.data()
          if (userDoc.uid === user.uid) {

            fireStore.doc(`users/${doc.id}`).update({
              favorites: [...userDoc.favorites, id]
            })
          }
        })
      })
    setUser({
      ...user, favorites: [...user.favorites, id]
    })
    // .then(userDoc => {
    //   console.log(userDoc)
    // })
  }



  return (
    <div className="App">

      {user ? (
        <div className='containerFeed'>

          <div className="user-profile">

            <img className="user-profile-pic" src={user.photoURL} alt="" />

            <button className='login-btn-logout' onClick={logout}>
              Logout
              <img src={logoutlogo} className='login-btn-logout-img' />
            </button>

          </div>

          <form className='containerTweet' data={data} setData={setData} >

            <p>¡Hola {user.displayName}!</p>

            <textarea
              name='tweet'
              onChange={handleChange}
              value={tweet.tweet}
              cols="30"
              rows="5"
              placeholder='Ey! escribe tu tweet!'
            />

            {/* <input
            name='username'
            onChange={handleChange}
            value={tweet.username}
            type="text"
            placeholder='Escribe tu username'
          /> */}
            <button className='sendtweet' onClick={handleSubmit}>POST</button>

          </form>


          <button className='btn-feed' type="button" onClick={() => setView("feed")}>Posts</button>
          <button className='btn-favs' type="button" onClick={() => setView("favs")}>Favorites</button>

          {isSearch ? <Spinner /> : null}


          {(view === "feed" ? data : favs).map(item => (
            <div className='tweetbox' key={item.id}>

              <div className='containerPhotoTweet'>
                <img src={item.photo} />
              </div>

              <div className='containerAllTweet'>

                <div className='containerHeaderTweet'>

                  <p>{item.username}</p>


                  {
                    (user !== null && user.uid === item.uid) &&
                    <button className='delete' onClick={() => deleteTweet(item.id)}>
                      <img src={trash} />
                    </button>
                  }

                </div>

                <p className='email'>{item.email}</p>

                <p className='boxTweet'>{item.tweet}</p>



                <span className='containerLikes'>
                  <img className='likesbtn' src={like} alt="" onClick={() => likeTweet(item.id, item.likes)} />
                  {/* <span>{item.likes ? item.likes : 0}</span> */}
                  <span className='likesCounter'>{item.likes || 0}</span>
                </span>

              </div>







            </div>
          ))}


        </div>


      ) : (

        <div className='logoutContainer'>

          <img className='logodevs' src={logobig} />


          <h1 className='title1'>LOREM IPSUM DOLOR</h1>
          <h2 className='title2'>Lorem ipsum dolor sit amet, consectetur adipiscing elit</h2>

          <div className='buttonContainer'>
            <div className='logoContainer'>
              <img className='logogoogle' src={logogoogle} />
            </div>
            <button className="login-btn" onClick={loginConGoogle}>
              Sign in with Google
            </button>
          </div>

          <p className='likefooter'>© 2020 Devs_United - <span className='likefooter-beta'>BETA</span></p>

          <div className='likefooter-box'></div>




        </div>
      )}





    </div>
  );
}



