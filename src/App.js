import React, { useEffect, useState } from 'react'
import logo from './logo.svg';
import './App.css';
import { fireStore, loginConGoogle, auth, logout } from './firebase/firebase';
import corazon from "./corazon.svg"

function App() {

  const [data, setData] = useState([])
  const [isSearch, setIsSearch] = useState(false);
  const [user, setUser] = useState(null);
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
        <div>
          <div className="user-profile">

            <img className="user-profile-pic" src={user.photoURL} alt="" />

            <p>¡Hola {user.displayName}!</p>

            <button className='login-btn-logout' onClick={logout}>Log out</button>

          </div>
        </div>
      ) : (
        <button className="login-btn" onClick={loginConGoogle}>
          Sign in with Google
        </button>
      )}



      <form data={data} setData={setData} >

        <textarea
          name='tweet'
          onChange={handleChange}
          value={tweet.tweet}
          cols="30"
          rows="5"
          placeholder='Ey! escribe tu tweet!'
        />
        <div>
          {/* <input
            name='username'
            onChange={handleChange}
            value={tweet.username}
            type="text"
            placeholder='Escribe tu username'
          /> */}
          <button className='sendtweet' onClick={handleSubmit}>Enviar tweet</button>
        </div>
      </form>


      <h1>Twitterss</h1>

      {isSearch ? <p>Cargando...</p> : null}


      {data.map(item => (
        <div className='tweetbox' key={item.id}>

          <div>
            <p>{item.tweet}</p>
            <p> Por: {item.username}</p>
            <p>{item.email}</p>
          </div>

          {
            (user !== null && user.uid === item.uid) &&
            <button className='delete' onClick={() => deleteTweet(item.id)}>Borrar</button>

          }


          <span>
            <img className='likesbtn' src={corazon} alt="" onClick={() => likeTweet(item.id, item.likes)} />
            {/* <span>{item.likes ? item.likes : 0}</span> */}
            <span>{item.likes || 0}</span>
          </span>


        </div>
      ))}

    </div>
  );
}

export default App;
