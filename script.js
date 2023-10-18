let dailyword = '' // keeps track of the daily word
let guessedWord = ''; // keeps track of the word guessed
const MAXLENGTH = 5; // the word is a 5 lettered word
let rowCount = 0; // row entry of the word
let loader = document.querySelector('.info-bar'); // loading icon
let changeRowCount = true; // flag to check if the previous guess was right, if correct change row
let invalidEntry = false; // to check if the previous entry was invalid
let end = false; // flag that end the game

init();

async function init(){
  loaderLogic(false);
  // gets the word of the day
  // const currentWordURL = 'https://words.dev-apis.com/word-of-the-day';
  const currentWordURL = 'https://words.dev-apis.com/word-of-the-day?random=1';
  let promise = await fetch(currentWordURL);
  let processedResponse = await promise.json();
  dailyword = (processedResponse.word).toUpperCase();
  loaderLogic(true);
  keyPressLogic();
}
// shows/hides the loader
function loaderLogic(value){
  loader.classList.toggle('hidden',value)
}

function keyPressLogic(){
    document.addEventListener('keydown',function keyPressFunction (event){
      if(end)
        return undefined;
        // event.preventDefault() // ends event
      else
        letterLogic(event.key.toUpperCase()) // tracks the key pressed
    }) 
}

async function checkValidity(){
  if(guessedWord.length != MAXLENGTH){
    return undefined; // continue typing
  }
  loaderLogic(false)
  // checks if the entered word is a valid word
  let res = await fetch('https://words.dev-apis.com/validate-word',{
    method: 'POST',
    body: JSON.stringify({word: guessedWord})
  })
  let processedRes = await res.json();
  loaderLogic(true)

  if(processedRes.validWord){
    invalidEntry = false
    // correct guess logic
    if(guessedWord == dailyword){
      alert('You guessed it')
      end = true;
      document.querySelector('.project-title').classList.add('winner');
    }
    else{
      // maximum tries reached logic
      if(rowCount == MAXLENGTH){
        alert(`The Correct Word is ${dailyword}`)
        end = true;
      }
    }
    markCorrectLetter()
    changeRowCount = true;
  }
  else{
      invalidEntry = true
      changeState()
  }
  // resets the word so that the next entry can be registered
    if(changeRowCount){
      guessedWord = ''
      rowCount++;
    } // contition check 

  reloadButtonLogic()
}

function markCorrectLetter(){
  let dailyWordSplit = dailyword.split('');
  let dailywordMap = mapWords(dailyWordSplit); // if daily word 'photo' then dailywordMap = {p:1,h:1,o:2,t:1}
  let guessedWordSplit = guessedWord.split('');

  for (let i = 0; i < MAXLENGTH; i++){
    // if index of the guessed word's letter matches that of daily word's letter highlight it in green
    if(guessedWordSplit[i] === dailyWordSplit[i]){
      document.querySelector(`.box-${MAXLENGTH*rowCount+i+1}`).classList.add('correct')
      dailywordMap[guessedWordSplit[i]]--; // removes the correct letter from the daily letter count object
    }
  }

  for (let i = 0; i < MAXLENGTH; i++){
    if(guessedWordSplit[i] === dailyWordSplit[i]){
      continue;// do nothing
    }
    // highlights the close letters
    else if(dailyWordSplit.includes(guessedWordSplit[i]) && dailywordMap[guessedWordSplit[i]] > 0){
      document.querySelector(`.box-${MAXLENGTH*rowCount+i+1}`).classList.add('close');
      dailywordMap[guessedWordSplit[i]]--; // removes the close letter from the daily letter count object
    }
    // highlights the wrong letters
    else{
      document.querySelector(`.box-${MAXLENGTH*rowCount+i+1}`).classList.add('wrong')
    }
  }

  // If we had one for loop - eg. Daily Word: POOLS, Guessed Word: OOOOO, it'd hightlight 1st O as close, 2nd and 3rd O as correct but in actuality 1st O should be marked wrong, 2nd and 3rd O should be marked correct.
}

// if word guessed is wrong the box turns red else if the box is red and the word guessed is right it reverts the color of the box and highlights the correct close and wrong letters
function changeState(){
  for(let i = 1;i<=MAXLENGTH;i++){
    let val = MAXLENGTH*(rowCount)+i // if row is 2, then targeted boxes - 6,7,8,9,10
    document.querySelector(`.box-${val}`).classList.add('invalid')

    // after invalid class is added, this removes it so the animation can reoccur
    setTimeout(() => {
      document.querySelector(`.box-${val}`).classList.remove('invalid')
    }, 1500);
  }
  changeRowCount = false;
}

function mapWords(arr){
  let wordMapObj = {}
  for(let i = 0; i< arr.length; i++){
    if(wordMapObj[arr[i]]){ // checks if the current letter is present in the obj
      wordMapObj[arr[i]]++ // if repeated word => {a: 2}
    }
    else{
      wordMapObj[arr[i]] = 1 // if unique letter then value is set to 1 eg {a: 1}
    }
  }
  return wordMapObj;
}

function letterLogic(key){
  if(key == 'ENTER'){
    checkValidity()
  }
  else if(key == 'BACKSPACE'){
    removeLetter()
  }
  else if(isValidKey(key)){
    handleLetter(key)
  }
  else{
    return undefined; // do nothing
  }
}

function removeLetter(){
  // removes last letter
  if(guessedWord.length){
    document.querySelector(`.box-${MAXLENGTH*rowCount+guessedWord.length}`).innerText = '';
  }
  // updates the guessed word
  guessedWord = guessedWord.substring(0,guessedWord.length-1)
  // guessedWord = guessedWord.substring(0,guessedWord.length-1)
  // document.querySelector(`.box-${MAXLENGTH*rowCount+guessedWord.length+1}`).innerText = '';
}

function handleLetter(key){
  if(guessedWord.length < MAXLENGTH){
    // updates the guessed word
    guessedWord += key
  }
  else{
    // updates the last letter of the guessed word
    guessedWord = guessedWord.substring(0,guessedWord.length-1)+key 
  }
  // adds the letter pressed to the inside of the box
  document.querySelector(`.box-${MAXLENGTH*rowCount+guessedWord.length}`).innerText = key;
}

// checks if the key is a valid alphabet
function isValidKey(key){
  return /^[a-zA-Z]$/.test(key);
}

// show/hide reload button logic
function reloadButtonLogic(){
  const reloadButton = document.querySelector('.reload-button');
  reloadButton.classList.toggle('hidden', !end);
  // Reload the page
  reloadButton.addEventListener('click', function reloadPage(){
    location.reload();
    // window.location.href = window.location.href; //If location.reload() doesn't work
  })
}