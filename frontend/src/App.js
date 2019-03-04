import React, {Component} from 'react';
//import { GoogleLogin, GoogleLogout } from 'react-google-login';
/*
const responseGoogle = (response) => {
  console.log(response);
};
*/
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      users: [],
      gameUsers: [],
      userClassName: ["", "", ""],
      correctUser: null,
      choosenUser: -1,
      showInstallMessage: false,
      view: "game"
    };
  }

  onClickInstallMessage() {
    this.setState({showInstallMessage: false});
  }

  onChangeView(view) {
    this.onGetUser();
    this.setState({view: view});
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  onGetUser() {
    this.setState({choosenUser: -1});
    this.setState({userClassName: ["", "", ""]});
    let users = this.state.users;
    this.shuffle(users);
    let gameUsers = [users[0], users[1], users[2]];
    let correctUser = Math.floor(Math.random() * 3);
    this.setState({correctUser: correctUser});
    this.setState({gameUsers: gameUsers});
  }

  checkResult(choosenUser) {
    this.setState({
      userClassName: [
        this.getClassName(0, choosenUser),
        this.getClassName(1, choosenUser),
        this.getClassName(2, choosenUser)
      ]
    });
    if (this.state.correctUser === choosenUser) {
      setTimeout(() => this.onGetUser(), 1000);
    }
  }

  getClassName(userId, choosenUser) {
    if (this.state.correctUser === choosenUser && userId === choosenUser) {
      return "correct";
    }
    else if (this.state.correctUser !== choosenUser && userId === choosenUser) {
      return "error";
    }
    return "";
  }

  componentDidMount() {

    this.setState({isLoading: true});

    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    // Detects if device is in standalone mode
    const isInStandaloneMode = () => window.matchMedia('(display-mode: standalone)').matches;

    // Checks if should display install popup notification:
    if (isIos() && !isInStandaloneMode()) {
      this.setState({showInstallMessage: true});
    }

    fetch('https://randomuser.me/api/?results=20')
      .then(result => result.json())
      .then(items => this.setState({users: items.results, isLoading: false}))
      .then(() => this.onGetUser())
      .catch(error => this.setState({error, isLoading: false}));

  }

  render() {

    function cUp(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getName(item) {
      return cUp(item.name.first) + ' ' + cUp(item.name.last)
    }

    /*
    function getImagesFromWilli(googleResponse) {
      console.log(googleResponse);
      fetch('https://mywebsite.com/endpoint/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstParam: 'yourValue',
          secondParam: 'yourOtherValue',
        })
      })
    }
    */

    return (
      <div>
        {/*
        <GoogleLogin
          clientId="35855596459-voq0hvhoer6gh58kqpicbo5gp51a3tq6.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={getImagesFromWilli}
          onFailure={getImagesFromWilli}
        />
        <GoogleLogout
          buttonText="Logout"
        >
        </GoogleLogout>
        */}

        {!this.state.isLoading && <div className="navigation-container">
          <ul className={"navigation"}>
            <li className={this.state.view === "wall" ? "active" : ""} onClick={() => this.onChangeView("wall")}>
              <span>Picturewall</span></li>
            <li className={this.state.view === "game" ? "active" : ""} onClick={() => this.onChangeView("game")}>
              <span>Game</span></li>
          </ul>
        </div>}

        {this.state.error &&
        <div className="message error"><span>Error: {this.state.error.message}</span></div>
        }

        {this.state.isLoading &&
        <div className="message"><span>Loading...</span></div>
        }

        {!this.state.isLoading && this.state.gameUsers.length > 0 &&
        <div className="game" style={{display: this.state.view === "game" ? "block" : "none"}}>
          <div className="polaroids">
            <ul className="polaroid design">
              <li key="gameuser">
                <img onClick={() => this.onGetUser()} src={this.state.gameUsers[this.state.correctUser].picture.large}
                     alt=""/>
                <div className={"content"}>
                  <div onClick={() => this.checkResult(0)}
                       className={this.state.userClassName[0]}> {getName(this.state.gameUsers[0])}</div>
                  <div onClick={() => this.checkResult(1)}
                       className={this.state.userClassName[1]}> {getName(this.state.gameUsers[1])}</div>
                  <div onClick={() => this.checkResult(2)}
                       className={this.state.userClassName[2]}> {getName(this.state.gameUsers[2])}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        }

        {!this.state.isLoading &&
        <div className="wall" style={{display: this.state.view === "wall" ? "block" : "none"}}>
          <div className="polaroids">
            <ul className="polaroid design">
              {this.state.users.map(user =>
                <li key={user.login.uuid}>
                  <img src={user.picture.large} alt=""/>
                  <div className={"content"}>{getName(user)}</div>
                </li>
              )}
            </ul>
          </div>
        </div>
        }
      </div>
    );
  }
}

export default App;
