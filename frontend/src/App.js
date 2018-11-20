import React, {Component} from 'react';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      items: [],
      showInstallMessage: false
    };
  }

  onClickInstallMessage() {
    this.setState({showInstallMessage: false});
  }

  componentWillMount() {

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

    fetch('http://jsonplaceholder.typicode.com/photos')
      .then(result => result.json())
      .then(items => this.setState({items}));
  }

  render() {
    return (<div className="polaroids">
      <ul className="polaroid design">
          {this.state.items.slice(0, 10).map(item =>
            <li key={item.url}>
              <a href={item.url} title={item.title}>
                <img src={item.url} width="250" height="250" alt={item.title} />
                <span>{item.title}</span>
              </a>
            </li>
          )}
        </ul>
        {this.state.showInstallMessage && <div className={"install-message"} onClick={() => this.onClickInstallMessage()}>
          To install this WebApp on your phone, tap
          <svg className="shareIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><path d="M381.9 181l95.8-95.8v525.9c0 13.4 8.9 22.3 22.3 22.3s22.3-8.9 22.3-22.3V85.2l95.8 95.8c4.5 4.5 8.9 6.7 15.6 6.7 6.7 0 11.1-2.2 15.6-6.7 8.9-8.9 8.9-22.3 0-31.2L515.6 16.1c-2.2-2.2-4.5-4.5-6.7-4.5-4.5-2.2-11.1-2.2-17.8 0-2.2 2.2-4.5 2.2-6.7 4.5L350.7 149.8c-8.9 8.9-8.9 22.3 0 31.2 8.9 9 22.3 9 31.2 0zM812 276.9H633.7v44.6H812v624H188v-624h178.3v-44.6H188c-24.5 0-44.6 20.1-44.6 44.6v624c0 24.5 20.1 44.6 44.6 44.6h624c24.5 0 44.6-20.1 44.6-44.6v-624c0-24.6-20.1-44.6-44.6-44.6z"/></svg>
          below and select &ldquo;Add to homescreen&rdquo;.
        </div>}
      </div>
    );
  }
}

export default App;
