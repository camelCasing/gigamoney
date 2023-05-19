const firebaseConfig = {
};
  
firebase.initializeApp(firebaseConfig);
  
var db = firebase.firestore();

var crates = {
    "Coffee Crate": {
        "Items": {
            "Water": 7,
            "Milk": 2,
            "Caffeine": 1
        },
        "Price": 1
    },
    "School Snacks": {
        "Items": {
            "Raisen": 1,
            "Milk": 9,
        },
        "Price": 2.5
    }
}

var oneMineMultiplier = 1.08;
var multipleMineMultiplier = 1.2;

var gemsMultiplier = 1.15;

var inGame = false;

var maxBlackjackCardValue = 8;

function setupTheSignOutOrUsername() {
    if (localStorage.getItem("gigamoney-user") != null) {
        if (localStorage.getItem("gigamoney-user") != "") {
            document.getElementById("login-button").style["display"] = "none";
            document.getElementById("username-display").style["opacity"] = "100%";
            document.getElementById("username-display").innerHTML = localStorage.getItem("gigamoney-user");
            document.getElementById("logout-button").style["display"] = "block";
        }
    }
}

function attemptLoginIfNotCreateAccount(username, password) {
    if (username != "") {
        if (password != "") {
            var userExists = false;

            db.collection("users").get()
                .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    if (doc.data().user === username) {
                        userExists = true;
                    
                        if (doc.data().pass == password) {
                            localStorage.setItem("gigamoney-user", username);
        
                            createNotification("gigamoney", "Welcome back, "+username+"!")

                            goToPage("home.html");
                        } else {
                            createNotification("gigamoney", "Wrong password :/");
                        }
                    }
                });

                if (userExists == false) {
                    db.collection("users").add({
                        user: username,
                        pass: password,
                        coin: 0.003,
                        codes: {}
                    })
                    .then(function(docRef) {
                        console.log("Document written with ID: ", docRef.id);
                        createNotification("gigamoney", "Welcome, "+username+"!")
                        goToPage("home.html");
                        localStorage.setItem("gigamoney-user", username);
                    })
                    .catch(function(error) {
                        console.error("Error adding document: ", error);
                    });
                }
            })
        }
    }
}

var loopCounter = 0; // Declare loopCounter outside the function

function unbox(crateName) {
    if (true) {
        document.getElementById("crate-opening-div").style["opacity"] = "100%";

        var crateItemLength = Object.entries(crates[crateName]["Items"]).length;
        var chosenNumber = Math.floor(Math.random() * 11);
        var chosenItem = "";

        console.log(chosenNumber);

        if (crateItemLength > 0) {
            if (chosenNumber === 0) {
                chosenItem = Object.keys(crates[crateName]["Items"])[0];
            } else {
                Object.keys(crates[crateName]["Items"]).forEach(key => {
                    const value = crates[crateName]["Items"][key];
                
                    if (chosenItem === "" && chosenNumber >= value) {
                        chosenItem = key;
                    }
                });
            }
        }

        var startTime = new Date().getTime(); // Get the current timestamp
          var maxDelay = 2500; // 5 seconds in milliseconds
          var delay = 100; // Initial delay of 100 milliseconds
          var intervalId;

          intervalId = setInterval(function() {
            // Code to execute in each loop iteration
            var itemKeys = Object.keys(crates[crateName]["Items"]);
            var randomKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
            var randomItem = crates[crateName]["Items"][randomKey];
            document.getElementById("crate-opening-div").innerHTML = randomKey;

            loopCounter++;

            var currentTime = new Date().getTime(); // Get the current timestamp
            var elapsedTime = currentTime - startTime;

            if (elapsedTime >= maxDelay) {
              clearInterval(intervalId); // Stop the loop after reaching the maximum delay
      
              document.getElementById("crate-opening-div").innerHTML = chosenItem;
      
              setTimeout(() => {
                document.getElementById("crate-opening-div").style["opacity"] = "0%";
              }, 2500);
            } else {
              delay += 100; // Increase the delay by 100 milliseconds
            }
          }, delay);

        loopIteration(); // Start the loop
    }
}

function caseGridShow() {
    if (document.getElementById("case-grid-container")) {
        Object.keys(crates).forEach(key => {
            console.log(key);
            var crateObject = document.getElementById("example-crate-contain").cloneNode(true);
            crateObject.style["display"] = "block";
            crateObject.id = "";
            crateObject.innerHTML = key+"<br>£"+crates[key]["Price"];
            document.getElementById("case-grid-container").appendChild(crateObject);

            crateObject.addEventListener("click", function() {
                unbox(key);
            })
        });
    }
}

function logout() {
    localStorage.removeItem("gigamoney-user");
    createNotification("gigamoney", "Signed out 😢");
    goToPage("login.html");
}

function goToPage(url) {
    window.location.href = url;
}

function setCoinageAmount(amount) {
  amount = parseFloat(amount); // Convert to number explicitly

  if (isNaN(amount)) {
    console.error("Invalid amount entered!");
    return;
  }
  
  db.collection("users").get()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        if (doc.data().user === localStorage.getItem("gigamoney-user")) {
          var documentRef = db.collection("users").doc(doc.id);

          documentRef.update({
            coin: amount,
          })
          .then(function() {
            console.log("Document successfully updated!");

            showMoolah();
          })
          .catch(function(error) {
            console.error("Error updating document: ", error);
          });
        }
      });
    });
}

function setupMinePlacesHelper(minesPlaced, mines) {
    if (minesPlaced < mines) {
        var chosenNumber = Math.floor(Math.random() * 26);
    
        if (minePlaces[chosenNumber] == "safe") {
            minePlaces[chosenNumber] = "mine";
            minesPlaced += 1;
        }
    }
}

function playMines(mines, coinage) {
    if (localStorage.getItem("gigamoney-user") != null) {
        var playersCoins = 0;

        db.collection("users").get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    if (doc.data().user === localStorage.getItem("gigamoney-user")) {
                        playersCoins = doc.data().coin;
                    }
                });

                if (playersCoins >= coinage) {
                    setCoinageAmount(playersCoins - coinage);

                    var audio = new Audio("sounds/landmine-plant.mp3");
                    audio.play();

                    var minePlaces = {
                        1: "safe",
                        2: "safe",
                        3: "safe",
                        4: "safe",
                        5: "safe",
                        6: "safe",
                        7: "safe",
                        8: "safe",
                        9: "safe",
                        10: "safe",
                        11: "safe",
                        12: "safe",
                        13: "safe",
                        14: "safe",
                        15: "safe",
                        16: "safe",
                        17: "safe",
                        18: "safe",
                        19: "safe",
                        20: "safe",
                        21: "safe",
                        22: "safe",
                        23: "safe",
                        24: "safe",
                        25: "safe"
                    }
                
                    var index = 1;
                    var minesPlaced = 0;
                    var returnAmount = coinage;
                    var canPlay = true;

                    document.getElementById("mines-confirmation").innerHTML = "Cash Out "+Number(returnAmount).toFixed(3);
                
                    while (index < 27) {
                        index += 1;
                    
                        if (minesPlaced < mines) {
                            var chosenNumber = Math.floor(Math.random() * 26);
                        
                            if (minePlaces[chosenNumber] == "safe") {
                                minePlaces[chosenNumber] = "mine";
                                minesPlaced += 1;
                            } else {
                                var chosenNumber = Math.floor(Math.random() * 26);
                                
                                if (minePlaces[chosenNumber] == "safe") {
                                    minePlaces[chosenNumber] = "mine";
                                    minesPlaced += 1;
                                } else {
                                    var chosenNumber = Math.floor(Math.random() * 26);
                                    
                                    if (minePlaces[chosenNumber] == "safe") {
                                        minePlaces[chosenNumber] = "mine";
                                        minesPlaced += 1;
                                    } else {
                                        var chosenNumber = Math.floor(Math.random() * 26);
                                        
                                        if (minePlaces[chosenNumber] == "safe") {
                                            minePlaces[chosenNumber] = "mine";
                                            minesPlaced += 1;
                                        } else {
                                            var chosenNumber = Math.floor(Math.random() * 26);
                                            
                                            if (minePlaces[chosenNumber] == "safe") {
                                                minePlaces[chosenNumber] = "mine";
                                                minesPlaced += 1;
                                            } else {
                                                var chosenNumber = Math.floor(Math.random() * 26);
                                                
                                                if (minePlaces[chosenNumber] == "safe") {
                                                    minePlaces[chosenNumber] = "mine";
                                                    minesPlaced += 1;
                                                } else {
                                                    var chosenNumber = Math.floor(Math.random() * 26);
                                                    
                                                    if (minePlaces[chosenNumber] == "safe") {
                                                        minePlaces[chosenNumber] = "mine";
                                                        minesPlaced += 1;
                                                    } else {
                                                        var chosenNumber = Math.floor(Math.random() * 26);
                                                        
                                                        if (minePlaces[chosenNumber] == "safe") {
                                                            minePlaces[chosenNumber] = "mine";
                                                            minesPlaced += 1;
                                                        } else {
                                                            var chosenNumber = Math.floor(Math.random() * 26);
                                                            
                                                            if (minePlaces[chosenNumber] == "safe") {
                                                                minePlaces[chosenNumber] = "mine";
                                                                minesPlaced += 1;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                
                    const container = document.getElementById("mines-container");
                    const objects = container.children;
                
                    for (let i = objects.length - 1; i >= 0; i--) {
                        const object = objects[i];
                        if (object.id !== "template-mine-button") {
                            container.removeChild(object);
                        }
                    }
                
                    const objectToClone = document.getElementById("template-mine-button");
                    const container2 = document.getElementById('mines-container');
                
                    for (let i = 1; i <= 25; i++) {
                      const clone = objectToClone.cloneNode(true);
                      clone.id = 'object' + (i + 1);
                      clone.innerText = 'Object ' + (i + 1);
                      clone.style["display"] = "block";
                      container2.appendChild(clone);
                    
                      clone.addEventListener("click", function() {
                        if (clone.id != "clicked") {
                            if (canPlay) {
                                clone.id = "clicked";
                                if (minePlaces[i] == "mine") {
                                    canPlay = false;

                                    var audio = new Audio("sounds/landmine-blow.mp3");
                                    audio.play();

                                    clone.setAttribute("src", "images/mines-loss.png")
                                    clone.setAttribute("class", "mine-button mine-button-l")

                                    const container = document.getElementById("mines-container");
                                    const objects = container.children;
                                
                                    for (let i2 = objects.length - 1; i2 >= 0; i2--) {
                                        const object = objects[i2];
                                        if (object.id != "clicked") {
                                            if (minePlaces[i2] == "mine") {
                                                object.setAttribute("class", "mine-button-alt mine-button-l mine-button-tint")
                                                object.setAttribute("src", "images/mines-loss.png")
                                            } else {
                                                object.setAttribute("class", "mine-button-alt mine-button-w mine-button-tint")
                                                object.setAttribute("src", "images/mines-win.png")
                                            }
                                        }
                                    }

                                    returnAmount = 0;
                                    document.getElementById("mines-confirmation").innerHTML = "Reload"
                                } else {
                                    clone.setAttribute("src", "images/mines-win.png")
                                    clone.setAttribute("class", "mine-button mine-button-w")
                                    if (mines > 4) {
                                        returnAmount *= (multipleMineMultiplier * (mines * 0.2))
                                    } else {
                                        returnAmount *= oneMineMultiplier
                                    }
                                    document.getElementById("mines-confirmation").innerHTML = "Cash Out "+Number(returnAmount).toFixed(3);
                                }
                            }
                        }
                      })
                    }

                    
                    document.getElementById("mines-confirmation").removeAttribute("onclick");
                    document.getElementById("mines-confirmation").addEventListener("click", function() {

                        if (document.getElementById("mines-confirmation").innerHTML == "Reload") {
                            window.location.reload()
                        }

                        var audio = new Audio("sounds/cash-out.mp3");
                        audio.play();

                        db.collection("users").get()
                            .then(function(querySnapshot) {
                            querySnapshot.forEach(function(doc) {
                                if (doc.data().user === localStorage.getItem("gigamoney-user")) {
                                    var documentRef = db.collection("users").doc(doc.id);
                                
                                    documentRef.update({
                                        coin: (playersCoins - coinage) + returnAmount,
                                    })
                                    .then(function() {
                                        console.log("Document successfully updated!");
                                        document.getElementById("mines-confirmation").innerHTML = "Reload";

                                        createNotification("Mines", "")

                                        const container = document.getElementById("mines-container");
                                        const objects = container.children;
                                    
                                        canPlay = false;

                                        for (let i2 = objects.length - 1; i2 >= 0; i2--) {
                                            const object = objects[i2];
                                            if (object.id != "clicked") {
                                                if (minePlaces[i2] == "mine") {
                                                    object.setAttribute("class", "mine-button-alt mine-button-l mine-button-tint")
                                                    object.setAttribute("src", "images/mines-loss.png")
                                                } else {
                                                    object.setAttribute("class", "mine-button-alt mine-button-w mine-button-tint")
                                                    object.setAttribute("src", "images/mines-win.png")
                                                }
                                            }
                                        }
                                    })
                                    .catch(function(error) {
                                        console.error("Error updating document: ", error);
                                    });
                                }
                            });
                        })
                    })

                    console.log(minePlaces)
                } else {
                    createNotification("gigamoney", "You are too poor for this much 😢")
                }
        })
    } else {
        createNotification("gigamoney", "Not signed in bozo");
        goToPage("login.html");
    }
}

function getAuthenticatedUserDocument() {
    if (localStorage.getItem("gigamoney-user") != null) {
        db.collection("users").get()
                .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    if (doc.data().user === localStorage.getItem("gigamoney-user")) {
                        console.log(doc.data().coin);
                        return doc.data();
                    }
                });
            })
    }
}

function showMoolah() {
    if (localStorage.getItem("gigamoney-user") != null) {
        db.collection("users").get()
                .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    if (doc.data().user === localStorage.getItem("gigamoney-user")) {
                        document.getElementById("cash-money-display").innerHTML = doc.data().coin.toFixed(3)+"p";
                    }
                });
            })
    }
}

function saveInputs() {
    window.addEventListener('beforeunload', function(event) {
        // Iterate over each input element and store its value in localStorage
        var inputs = document.getElementsByClassName("inputs-to-save");
        for (var i = 0; i < inputs.length; i++) {
          var input = inputs[i];

          if (input.type === 'number') {
            localStorage.setItem("ITSLS-"+input.id, input.value);
          }
        }
      });

    window.addEventListener('load', function() {
      // Iterate over each input element and retrieve its value from localStorage
      var inputs = document.getElementsByClassName("inputs-to-save");
      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        if (input.type === 'number') {
          var storedValue = localStorage.getItem("ITSLS-"+input.id);
          if (storedValue !== null) {
            input.value = storedValue;
          }
        }
      }
    })
}

function manageHomePageButtons() {
    if (document.getElementById("game-cards")) {
        const container = document.getElementById("game-cards");
        const objects = container.children;
    
        for (let i2 = objects.length - 1; i2 >= 0; i2--) {
            const object = objects[i2];
            
            object.addEventListener("click", function() {
                goToPage(object.getAttribute("target"));
            })
        }
    }
}

function setMinimalInput(object, minimal, maximum) {
    if (object.value < minimal) {
        object.value = minimal;
    }

    if (object.value > maximum) {
        object.value = maximum;
    }
}

function getTimestampInSeconds () {
    return Math.floor(Date.now() / 1000)
}

function playCrash(betAmount, autoCashout) {
    var currentlyBetting = false;


    if (inGame === false) {
        db.collection("users").get()
            .then(function(querySnapshot) {
                playerCoins = 0;

                querySnapshot.forEach(function(doc) {
                    if (doc.data().user === localStorage.getItem("gigamoney-user")) {
                        playersCoins = doc.data().coin;

                        if (doc.data().coin >= betAmount) {
                            var multiplierText = document.getElementById("multiplier-text");
                            var multiplier = generateCrashMultiplier(); // Multiply by 100 to work with integers
                            var returnAmount = 0;
                            currentlyBetting = true;

                            setCoinageAmount(doc.data().coin - betAmount);

                            var audio = new Audio("sounds/landmine-plant.mp3");
                            audio.play();
        
                            inGame = true;
        
                            var counter = 0;

                            document.getElementById("crash-confirmation").addEventListener("click", function() {
                                if (currentlyBetting == true) {
                                    currentlyBetting = false;

                                    var audio = new Audio("sounds/cash-out.mp3");
                                    audio.play();

                                    setCoinageAmount((doc.data().coin - betAmount) + returnAmount);
                                    console.log("Withdrew")
                                }
                            })
        
                            const intervalId = setInterval(() => {
                                counter += 0.001;
                                
                                multiplierText.innerHTML = "x" + (counter).toFixed(3); // Display with two decimal places
                                
                                if (counter >= 1) {
                                    multiplierText.style["color"] = "#3cff00"
                                } else {
                                    multiplierText.style["color"] = "#ff1100"
                                }
        
                                if (inGame == true) {
                                    returnAmount = betAmount * counter
                                    document.getElementById("cashout-text").innerHTML = returnAmount.toFixed(3)+"p"
                                }
        
                                if (counter >= multiplier) {
                                  clearInterval(intervalId);
                                  inGame = false;
                                  currentlyBetting = false;

                                var audio = new Audio("sounds/landmine-blow.mp3");
                                audio.play();
                                }
                            }, multiplier / counter); // Adjust the interval duration if needed
                        } else {
                            createNotification("gigamoney", "You are too much of a brokie for this amount!")
                        }
                    }
                });
        })
    }
  }
  

function generateCrashMultiplier() {
    const randNum = Math.random();

    let multiplier;

    if (randNum < 0.3) {
        // 69% of the time, generate a multiplier between 1 and 3
      multiplier = 1 + Math.random() * 4;
    } else if (randNum < 0.99) {
        // 30% of the time, generate a multiplier between 0.5 and 1
      multiplier = 0.5 + Math.random() * 2;
    } else {
      // 1% of the time, generate a multiplier between 3 and 1000
      multiplier = 3 + Math.random() * 7;
    }

    return multiplier;
}

function playGems(betAmount) {
    if (inGame === false) {
      db.collection("users")
        .get()
        .then(function(querySnapshot) {
          playerCoins = 0;
  
          querySnapshot.forEach(function(doc) {
            if (doc.data().user === localStorage.getItem("gigamoney-user")) {
              if (doc.data().coin >= betAmount) {
                inGame = true;
  
                playerCoins = doc.data().coin;

                setCoinageAmount(playerCoins - betAmount)

                var redGems = 0;
                var greenGems = 0;
                var blueGems = 0;
                var yellowGems = 0;
                var pinkGems = 0;
  
                var times = 5;
  
                var returnAmount = betAmount;
                var multiplier = 1;
                var hits = 0;

                var gemsSpawned = 0;

                document.getElementById("cashout-text").innerHTML = "0.000p";
                document.getElementById("multiplier-text").style["color"] = "#fff";
                document.getElementById("multiplier-text").innerHTML ="x0.000";


                const container = document.getElementById("gem-container");
                const objects = container.children;

                for (let i2 = objects.length - 1; i2 >= 0; i2--) {
                  const object = objects[i2];
                  if (object.id != "multiplier-text") {
                      if (object.id != "cashout-text") {
                        if (object.id != "gem-template") {
                          object.remove()
                        }
                      }
                  }
              }


                function spawnGem(color, count) {


                  gemsSpawned += 1;
                  if (gemsSpawned == 5) {
  
                    inGame = false;

                    var redMultiplier = gemsMultiplier * redGems;
                    var greenMultiplier = gemsMultiplier * greenGems;
                    var blueMultiplier = gemsMultiplier * blueGems;
                    var yellowMultiplier = gemsMultiplier * yellowGems;
                    var pinkMultiplier = gemsMultiplier * pinkGems;
      
                    if (redGems >= 3) {
                      hits += 1;
                      returnAmount *= redMultiplier;
                      multiplier *= redMultiplier;
                    }
      
                    if (greenGems >= 3) {
                      hits += 1;
                      returnAmount *= greenMultiplier;
                      multiplier *= greenMultiplier;
                    }
      
                    if (yellowGems >= 3) {
                      hits += 1;
                      returnAmount *= yellowMultiplier;
                      multiplier *= yellowMultiplier;
                    }
      
                    if (blueGems >= 3) {
                      hits += 1;
                      returnAmount *= blueMultiplier;
                      multiplier *= blueMultiplier;
                    }
      
                    if (pinkGems >= 3) {
                      hits += 1;
                      returnAmount *= pinkMultiplier;
                      multiplier *= pinkMultiplier;
                    }
      
                    if (hits < 1) {
                      returnAmount = 0;
                      multiplier = 0;
                    }
      
                    document.getElementById("cashout-text").innerHTML =returnAmount.toFixed(3) + "p";
                    document.getElementById("multiplier-text").innerHTML ="x" + multiplier.toFixed(3);
                    console.log(returnAmount);
    
                    setCoinageAmount((playerCoins - betAmount) + returnAmount);
                    if (returnAmount > 0) {
                      createNotification("Gems", "You won "+returnAmount.toFixed(3)+"p");
                      document.getElementById("multiplier-text").style["color"] = "#45ff2c";

                      var audio = new Audio("sounds/cash-out.mp3");
                      audio.play();
                    } else {
                      document.getElementById("multiplier-text").style["color"] = "#ff1b1b";

                      var audio = new Audio("sounds/landmine-blow.mp3");
                      audio.play();
                    }
                  }

                  var audio = new Audio("sounds/pop.mp3");
                  audio.play();

                  var gem = document.getElementById("gem-template").cloneNode(true);
                  gem.id = "";
                  document.getElementById("gem-container").appendChild(gem);
                  gem.style.display = "block";
                  gem.setAttribute("src", "images/gems/" + color + "-gem.png");
  
                  if (color == "red") {
                    gem.style.filter =
                      "drop-shadow(0 0 5px #" +
                      getColorCode(color) +
                      25 * redGems +
                      ")";
                  } else if (color == "green") {
                    gem.style.filter =
                      "drop-shadow(0 0 5px #" +
                      getColorCode(color) +
                      25 * greenGems +
                      ")";
                  } else if (color == "blue") {
                    gem.style.filter =
                      "drop-shadow(0 0 5px #" +
                      getColorCode(color) +
                      25 * blueGems +
                      ")";
                  } else if (color == "yellow") {
                    gem.style.filter =
                      "drop-shadow(0 0 5px #" +
                      getColorCode(color) +
                      25 * yellowGems +
                      ")";
                  } else if (color == "pink") {
                    gem.style.filter =
                      "drop-shadow(0 0 5px #" +
                      getColorCode(color) +
                      25 * pinkGems +
                      ")";
                  }
  
                  gem.style.opacity = "0"; // Set initial opacity to 0
  
                  // Apply animation effects
                  gem.animate(
                    [
                      { opacity: "0", transform: "translateY(-20px)" }, // Initial keyframe
                      { opacity: "1", transform: "translateY(0)" }, // Final keyframe
                    ],
                    {
                      duration: 500, // Animation duration in milliseconds
                      easing: "ease-out", // Animation easing function
                      delay: count * 100, // Delay each gem animation by 100ms
                      fill: "forwards", // Maintain final state of the animation
                    }
                  );
                }
  
                function getColorCode(color) {
                  switch (color) {
                    case "red":
                      return "ff0000";
                    case "green":
                      return "51ff00";
                    case "blue":
                      return "002fff";
                    case "yellow":
                      return "ffe600";
                    case "pink":
                      return "f700ff";
                    default:
                      return "";
                  }
                }
  
                function spawnGemsDelayed(color, count, delay) {
                  setTimeout(function() {
                    var gemCount = 0;
                    var interval = setInterval(function() {
                      if (gemCount < count) {
                        spawnGem(color, 1);
                        gemCount++;
                      } else {
                        clearInterval(interval);
                      }
                    }, delay);
                  }, delay);
                }
  
                for (var i = 0; i < times; i++) {
                  var chosenNumber = Math.floor(Math.random() * 5) + 1;
  
                  if (chosenNumber == 1) {
                    redGems += 1;
                  } else if (chosenNumber == 2) {
                    greenGems += 1;
                  } else if (chosenNumber == 3) {
                    blueGems += 1;
                  } else if (chosenNumber == 4) {
                    yellowGems += 1;
                  } else if (chosenNumber == 5) {
                    pinkGems += 1;
                  }
                }
  
                var delay = 175; // 0.25 seconds
                var totalDelay = 0;
  
                spawnGemsDelayed("red", redGems, totalDelay);
                totalDelay += delay;
  
                spawnGemsDelayed("green", greenGems, totalDelay);
                totalDelay += delay;
  
                spawnGemsDelayed("blue", blueGems, totalDelay);
                totalDelay += delay;
  
                spawnGemsDelayed("yellow", yellowGems, totalDelay);
                totalDelay += delay;
  
                spawnGemsDelayed("pink", pinkGems, totalDelay);
              } else {
                createNotification("gigamoney", "You don't have enough coins for this bet!");
              }
            }
          });
        });
    }
  }

  function playSpinner(betAmount) {

    if (inGame == false) {
      db.collection("users")
      .get()
      .then(function(querySnapshot) {
        playerCoins = 0;

        querySnapshot.forEach(function(doc) {
          if (doc.data().user === localStorage.getItem("gigamoney-user")) {
            if (doc.data().coin >= betAmount) {
              playerCoins = doc.data().coin;

              if (playerCoins >= betAmount) {
                if (localStorage.getItem("gigamoney-user") != null) {
                  inGame = true;

                  setCoinageAmount(playerCoins - betAmount);

                  document.getElementById("spinner").style["transition"] = "0.1s";
                  document.getElementById("spinner").style.transform = "rotate(0deg)";
                  setTimeout(() => {
                    document.getElementById("spinner").style["transition"] = "1s";
                      
                    var audio = new Audio("sounds/pop.mp3");
                    audio.play();
          
                    var chosenNumber = Math.floor(Math.random() * 360); // Limit rotation to 180 degrees
          
                    if (chosenNumber > 180) {
                      document.getElementById("spinner").style.transform = "rotate(-" + chosenNumber + "deg)";
                    } else {
                      document.getElementById("spinner").style.transform = "rotate(-" + chosenNumber + "deg)";
                    }

                    setTimeout(() => {
                      inGame = false;

                      if (chosenNumber > 180) {
                        var audio = new Audio("sounds/cash-out.mp3");
                        audio.play();

                        createNotification("Spinner", "You just won "+(betAmount * 2).toFixed(3)+"p")
  
                        setCoinageAmount((playerCoins - betAmount) + (betAmount * 2));
                      } else {
                        document.getElementById("spinner").style.transform = "rotate(-" + chosenNumber + "deg)";
                        
                        var audio = new Audio("sounds/landmine-blow.mp3");
                        audio.play();
                      }
                    }, 1000);
                  }, 250);
                }
              }
            } else {
              createNotification("gigamoney", "You don't have enough coins for this bet!");
            }
          }
        });
      });
    }
  }
  

  function createNotification(title, description) {
    const notification = document.createElement("div");
    notification.className = "notification";
    
    const notificationTitle = document.createElement("div");
    notificationTitle.className = "notification-title";
    notificationTitle.innerText = title;
    
    const notificationDescription = document.createElement("div");
    notificationDescription.className = "notification-description";
    notificationDescription.innerText = description;
    
    notification.appendChild(notificationTitle);
    notification.appendChild(notificationDescription);
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
      notification.classList.add("notification-show");
    }, 100);
    
    setTimeout(function() {
      notification.classList.remove("notification-show");
      setTimeout(function() {
        document.body.removeChild(notification);
      }, 500);
    }, 5000);
  }
  
function playWhitejack(betAmount) {
  if (inGame == false) {
    if (localStorage.getItem("gigamoney-user") != null) {
      db.collection("users")
      .get()
      .then(function(querySnapshot) {
        playerCoins = 0;

        querySnapshot.forEach(function(doc) {
          if (doc.data().user === localStorage.getItem("gigamoney-user")) {
            if (doc.data().coin >= betAmount) {
              playerCoins = doc.data().coin;

              if (playerCoins >= betAmount) {
                inGame = true;

                var returnAmount = betAmount;
                var handValue = 0;
                var handCount = 0;
                var displayBetAmount = Number(betAmount);

                function createPlayingCard() {

                  var audio = new Audio("sounds/pop.mp3");
                  audio.play();

                  var chosenNumber = Math.floor(Math.random() * maxBlackjackCardValue);
                  handCount += 1;
                  handValue += chosenNumber;
                  returnAmount = (betAmount * (handValue * 0.1));
                  document.getElementById("win-text").innerHTML = "Win " + Number(returnAmount).toFixed(3) + "p";
                  document.getElementById("blackjack-stand").innerHTML = "Stand +" + returnAmount.toFixed(3) + "p";
                
                  if (handCount == 4) {
                    document.getElementById("blackjack-hit").className = "navbar-button-inactive";
                  }
                
                  var card = document.getElementById("playing-card-template").cloneNode(true);
                  document.getElementById("blackjack-container").appendChild(card);
                  card.style.opacity = "0"; // Set initial opacity to 0
                  card.style.transform = "translateY(-50px)"; // Move the card up initially
                  card.style.display = "block";
                  card.id = "";
                  card.querySelector("#playing-card-text-1").innerHTML = chosenNumber;
                  card.querySelector("#playing-card-text-2").innerHTML = chosenNumber;
                
                  // Trigger animation
                  setTimeout(function () {
                    card.style.opacity = "1"; // Fade in the card
                    card.style.transform = "translateY(0)"; // Move the card down to its original position
                  }, 100);
                }
                

                createPlayingCard()
                createPlayingCard()

                setCoinageAmount(playerCoins - betAmount)

                document.getElementById("blackjack-hit").className = "navbar-button";
                document.getElementById("bet-text").innerHTML = "Bet "+Number(displayBetAmount).toFixed(3)+"p";
                document.getElementById("blackjack-hit").innerHTML = "Hit -"+(betAmount / 4).toFixed(3)+"p";
                document.getElementById("blackjack-stand").className = "navbar-button";
                document.getElementById("blackjack-confirmation").className = "navbar-button-inactive";
                document.getElementById("blackjack-confirmation").removeAttribute("onclick");

                document.getElementById("blackjack-stand").addEventListener("click", function() {
                  returnAmount = (betAmount * (handValue * 0.1))
                  document.getElementById("win-text").innerHTML = "Win "+Number(returnAmount).toFixed(3)+"p";
                  document.getElementById("blackjack-stand").innerHTML = "Stand +"+returnAmount.toFixed(3)+"p";

                  db.collection("users").get()
                            .then(function(querySnapshot) {
                            querySnapshot.forEach(function(doc) {
                                if (doc.data().user === localStorage.getItem("gigamoney-user")) {
                                    var documentRef = db.collection("users").doc(doc.id);
                                    console.log(doc.data().coin)

                                    var audio = new Audio("sounds/cash-out.mp3");
                                    audio.play();
                                
                                    documentRef.update({
                                        coin: (doc.data().coin + returnAmount),
                                    })
                                    .then(function() {
                                        console.log("Document successfully updated!");
                                        setTimeout(() => {
                                          window.location.reload()
                                        }, 1000);
                                    })
                                    .catch(function(error) {
                                        console.error("Error updating document: ", error);
                                    });
                                }
                            });
                        })
                })
                
                document.getElementById("blackjack-hit").addEventListener("click", function() {
                  if (handCount < 4) {
                    if (localStorage.getItem("gigamoney-user") != null) {
                      db.collection("users")
                      .get()
                      .then(function(querySnapshot) {
                        querySnapshot.forEach(function(doc) {
                          if (doc.data().user === localStorage.getItem("gigamoney-user")) {
                            playerCoins = doc.data().coin;
                
                            if (playerCoins >= (betAmount / 4)) {
                              setCoinageAmount(playerCoins -= (betAmount / 4))
                              createPlayingCard();
                              //displayBetAmount += betAmount
                              //document.getElementById("bet-text").innerHTML = "Bet " + Number(displayBetAmount).toFixed(3) + "p";
                            } else {
                              createNotification("gigamoney", "You can not afford to hit");
                            }
                          }
                        });
                      });
                    } else {
                      createNotification("gigamoney", "You are not signed in");
                    }
                  }
                })
              }
            } else {
              createNotification("gigamoney", "You don't have enough coins for this bet");
            }
          }
        });
      });
    }
  }
}

setupTheSignOutOrUsername();
// playMines(1, 1)
saveInputs()
showMoolah()

caseGridShow()

manageHomePageButtons()

function manageAllAccounts() {
  db.collection("users").get()
  .then(function(querySnapshot) {
  querySnapshot.forEach(function(doc) {
    var documentRef = db.collection("users").doc(doc.id);
      
    documentRef.update({
        codes: {},
    })
    .then(function() {
        console.log("Document successfully updated!");
    })
    .catch(function(error) {
        console.error("Error updating document: ", error);
    });
  });
})
}