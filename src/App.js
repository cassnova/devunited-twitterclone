import React, { useEffect, useState } from 'react'
import logo from './logo.svg';
import './App.css';
import { fireStore, loginConGoogle, auth, logout } from './firebase/firebase';
import logobig from './imgs/logobig.svg'
import logogoogle from './imgs/logogoogle.png'
import logoutlogo from './imgs/logout.svg'
import like from './imgs/like.svg'
import trash from './imgs/trash.svg'


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
  });


  useEffect(() => {

    setIsSearch(true);

    const desuscribir = fireStore.collection('tweets')
      .onSnapshot((snapshot) => {
        const docs = []
        snapshot.forEach(doc => {

          const snap = {
            username: doc.data().username,
            tweet: doc.data().tweet,
            id: doc.id,
            likes: doc.data().likes,
            email: doc.data().email,
            uid: doc.data().uid
          }

          docs.push(snap)

        })
        setData(docs)

        setIsSearch(false)

        setFavs(tweet.filter(item => {
          return item.likes > 1;
        }))



      });

    auth.onAuthStateChanged((user) => {
      setUser(user);
      // console.log(user)
    });

    return () => {
      desuscribir()
    }
  }, []);

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
      username: user.displayName
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
        email: doc.data().email
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
    // console.log(id)
    fireStore.doc(`tweets/${id}`).update({ likes: innerLikes + 1 })
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

          {isSearch ? <p>Cargando...</p> : null}


          {(view === "feed" ? data : favs).map(item => (
            <div className='tweetbox' key={item.id}>

              <div className='containerPhotoTweet'>
                <img src={user.photoURL} />
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



