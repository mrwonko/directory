import React, {Component} from 'react';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      users: [],
      gameUsers: [],
      userClassName: ["","",""],
      correctUser: null,
      choosenUser: -1,
      showInstallMessage: false,
      view: "wall"
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
    this.setState({userClassName: ["","",""]});
    let users = this.state.users;
    this.shuffle(users);
    let gameUsers = [users[0], users[1], users[2]];
    let correctUser = Math.floor(Math.random() * 3);
    this.setState({correctUser: correctUser});
    this.setState({gameUsers: gameUsers});
  }

  checkResult(choosenUser) {
    this.setState({userClassName: [
        this.getClassName(0, choosenUser),
        this.getClassName(1, choosenUser),
        this.getClassName(2, choosenUser)
      ]});
    if (this.state.correctUser===choosenUser) {
      //todo: delay this
      //this.onGetUser();
    }
  }

  getClassName(userId, choosenUser) {
    if (this.state.correctUser===choosenUser && userId===choosenUser) {
      return "correct";
    }
    else if (this.state.correctUser!==choosenUser && userId===choosenUser) {
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

    return (
      <div>
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

        {!this.state.isLoading && this.state.gameUsers.length>0 &&
        <div className="game" style={{display: this.state.view === "game" ? "block" : "none"}}>
          <div className="polaroids">
            <ul className="polaroid design">
                <li key="gameuser">
                  <img onClick={() => this.onGetUser()} src={this.state.gameUsers[this.state.correctUser].picture.large} width="250" height="250" alt=""/>
                  <div className={"content"}>
                    <div onClick={()=>this.checkResult(0)} className={this.state.userClassName[0]}> {getName(this.state.gameUsers[0])}</div>
                    <div onClick={()=>this.checkResult(1)} className={this.state.userClassName[1]}> {getName(this.state.gameUsers[1])}</div>
                    <div onClick={()=>this.checkResult(2)} className={this.state.userClassName[2]}> {getName(this.state.gameUsers[2])}</div>
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
                  <img src={user.picture.large} width="250" height="250" alt=""/>
                  <div className={"content"}>{getName(user)}</div>
                </li>
              )}
            </ul>
          </div>
        </div>
        }

        {this.state.showInstallMessage &&
        <div className={"install-message"} onClick={() => this.onClickInstallMessage()}>
          To install this WebApp on your phone, tap
          <svg className="shareIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
            <path
              d="M381.9 181l95.8-95.8v525.9c0 13.4 8.9 22.3 22.3 22.3s22.3-8.9 22.3-22.3V85.2l95.8 95.8c4.5 4.5 8.9 6.7 15.6 6.7 6.7 0 11.1-2.2 15.6-6.7 8.9-8.9 8.9-22.3 0-31.2L515.6 16.1c-2.2-2.2-4.5-4.5-6.7-4.5-4.5-2.2-11.1-2.2-17.8 0-2.2 2.2-4.5 2.2-6.7 4.5L350.7 149.8c-8.9 8.9-8.9 22.3 0 31.2 8.9 9 22.3 9 31.2 0zM812 276.9H633.7v44.6H812v624H188v-624h178.3v-44.6H188c-24.5 0-44.6 20.1-44.6 44.6v624c0 24.5 20.1 44.6 44.6 44.6h624c24.5 0 44.6-20.1 44.6-44.6v-624c0-24.6-20.1-44.6-44.6-44.6z"/>
          </svg>
          below and select &ldquo;Add to homescreen&rdquo;.
        </div>}

      </div>
    );
  }
}

export default App;
