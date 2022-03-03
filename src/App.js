import React, {useEffect, useState} from 'react'
import logo from './logo.svg';
import './App.css';
import { fireStore } from './firebase/firebase';

function App() {

  const [data, setData] = useState([])
  const [tweet, setTweet] = useState({
    tweet:"",
    username:""

  })

  useEffect(()=> {
    fireStore.collection('tweets').get()
    .then((snapshot)=>{
      const docs = []
      snapshot.forEach(doc => {

        const snap={
          username:doc.data().username,
          tweet:doc.data().tweet,
          id:doc.id
        }
        
        docs.push(snap)

      })
      setData(docs)
    } )
  },[]);

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
      ...tweet,
      [e.target.name]: e.target.value
    }
    setTweet(newTweet)
  }



  function handleSubmit(e){
    e.preventDefault()
    const addTweet = fireStore.collection("tweets").add(tweet)
    const getDoc = addTweet.then(doc=> (doc.get()))
    getDoc.then(doc => {
      const currentTweet = {
        username:doc.data().username,
        tweet:doc.data().tweet,
        id:doc.id
      }
      setData([currentTweet, ...data])

    })
    setTweet({
      tweet:"",
      username:""
    })
    
  }

  console.log(tweet)
  
  return (
    <div className="App">

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
          <input
            name='username'
            onChange={handleChange}
            value={tweet.username}
            type="text"
            placeholder='Escribe tu username'
          />
          <button onClick={handleSubmit}>Enviar tweet</button>
        </div>  
      </form>


      <h1>Twitterss</h1>
        {data.map(item=> (
          <div key={item.id}>
            <p>
              Username: <strong>{item.username}</strong>
            </p>
            
            <p>{item.tweet}</p>
            <hr/>
            
          </div>
        ))}
      
    </div>
  );
}

export default App;
