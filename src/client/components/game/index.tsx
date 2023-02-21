/* eslint-disable no-nested-ternary */
import Phaser from 'phaser';
import React from 'react';

import Preload from './scenes/Preload';
import MainGame from './scenes/MainGame';
import Title from './scenes/Title';
import TitleUI from './ui/TitleUI';
import '../../css/index.css';
import ErrorModal from './ui/ErrorModal';
import DeathBox from './ui/DeathBox';
import SettingsPage from './ui/SettingsPage';
import SignupUI from './ui/SignupUI';
import LoginUI from './ui/LoginUI';

export default class Game extends React.Component {
    game: Phaser.Game;
    state: {
        signupOpen: any;
        loginOpen: any; activeScene: string; crashMessage: string | null; gameState: any; dbox: string | null; deathKills: number | null; deathCoins: number | null; deathKiller: string | null; settingsOpen: boolean; settings: any; user: any;
    };
    constructor(props: any) {
        super(props);
        let storedSettings = null;
        try {
            let d = window.localStorage.getItem('settings');
            if(d) {
            storedSettings = JSON.parse(d);
            }
        } catch (e) {
            console.log('Error loading settings from localStorage', e);
        }
        this.state = {
            activeScene: '',
            crashMessage: null,
            dbox: null,
            gameState: null,
            deathKills: null,
            deathCoins: null,
            settingsOpen: false,
            deathKiller: null,
            settings: storedSettings,
            signupOpen: false,
            loginOpen: false,
            user: null,
        };
    }

    componentDidMount() {
        // Create a simple configuation for the Phaser game
        const config = {
            type: Phaser.AUTO,
            parent: 'swordbattle',
            scene: [Preload, Title, MainGame],
            dom: {
                createContainer: true,
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            width: 1280,
            height: 720,
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                },
            },
            audio: {
                disableWebAudio: false,
            },
        };
        // eslint-disable-next-line no-new
        this.game = new Phaser.Game(config);
        (window as any).game = this.game;

        // Scene change handler
        // This is to handle the change of scenes and set state accordingly
        // We loop through the scenes once the game is ready
        // And create handlers when the scene is started
        this.game.events.once(Phaser.Core.Events.READY, () => {
            this.game.scene.scenes.forEach((scene: Phaser.Scene) => {
                scene.events.on(Phaser.Scenes.Events.START, () => {
                    this.setState({ activeScene: scene.sys.settings.key });
                });
                if (scene.sys.settings.key === 'maingame') {
                    scene.events.on('gameStateChange', (gameState: any) => {
                        this.setState(prevState => Object.assign(prevState, { gameState }));
                    });
                }
                if(scene.sys.settings.key === 'title') {
                    scene.events.on('settingsBtnClicked', () => {
                        scene.events.emit('settingsState', !this.state.settingsOpen);
                        this.setState(prevState => Object.assign(prevState, { settingsOpen: !prevState.settingsOpen }));
                    });
                    scene.events.on('settingsChanged', (settings: object) => {
                        console.log('settingsChanged', settings);
                        this.setState(prevState => Object.assign(prevState, { settings }));
                    });
                    scene.events.on('loginSuccessFetch', (data: any) => {
                        this.setState(prevState => Object.assign(prevState, { user: data.user}));
                    })

                    scene.events.on('loginBtnClicked', () => {
                        console.log('loginBtnClicked');
                        scene.events.emit('loginState', !this.state.loginOpen);
                        this.setState(prevState => Object.assign(prevState, { loginOpen: !prevState.loginOpen }));
                    });
                    scene.events.on('signupBtnClicked', () => {
                        console.log('signupBtnClicked');
                        scene.events.emit('signupState', !this.state.signupOpen);
                        this.setState(prevState => Object.assign(prevState, { signupOpen: !prevState.signupOpen }));
                    });

                }
                scene.events.on('crash', (message: string) => {
                    this.setState(prevState => Object.assign(prevState, { crashMessage: message }));
                });
                scene.events.on('death', (message, kls, klr, cns) => {

                    this.setState(prevState => Object.assign(prevState, { deathKiller: klr, deathCoins: cns, deathKills: kls, dbox: message }));

                });
            });
        });
    }

    render() {
        const { activeScene, crashMessage, dbox, gameState, settings, deathKills, deathCoins, deathKiller, settingsOpen, loginOpen, signupOpen, user } = this.state;
        return (
            <div
                style={{
                    position: 'fixed',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1,
                    width: crashMessage || dbox ? '100%' : activeScene === 'maingame' ? '0%' : '100%',
                    height: crashMessage || dbox ? '100%' : activeScene === 'maingame' ? '0%' : '100%',
                }}
            >
                {activeScene === 'title' ?
                settingsOpen ? <SettingsPage settings={settings}/> :
                loginOpen ? <LoginUI loginOpen={loginOpen} /> :
                signupOpen ? <SignupUI signupOpen={signupOpen} /> :

                 <TitleUI settingsOpen={settingsOpen} user={user} /> : null}
                {crashMessage ? <ErrorModal message={crashMessage} /> : null}
                {dbox? <DeathBox killer={deathKiller} kills={deathKills} coins={deathCoins}/> : null}
            </div>
        );
    }
}