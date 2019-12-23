import React from 'react';
import {withTranslation} from 'react-i18next';
import M from 'materialize-css';
import StarMap from './map';

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.parallax = [];
    }
    componentDidMount() {
        this.parallax.forEach((item) => {
            M.Parallax.init(item);
        });
    }

    render() {
        const {t} = this.props;

        return(
            <div>
                <StarMap className="static-star-field" useRandomData={true} disableControls={true}/>

                <div id="index-banner" class="parallax-container">
                    <div class="section no-pad-bot">
                        <div class="container">
                            <br/><br/>
                            <h1 class="header center">{t('home.title')}</h1>
                            <div class="row center">
                                <h5 class="header col s12 light">{t('home.description')}</h5>
                            </div>
                            <br/><br/>
                        </div>
                    </div>
                    
                </div>
            
                <div class="container">
                    <div class="section">
                        <div class="row">
                            <div class="col s12 m4">
                                <div class="icon-block">
                                    <h2 class="center deep-purple-text darken-2"><i class="material-icons">flash_on</i></h2>
                                    <h5 class="center">{t('home.point1.title')}</h5>
                                    <p class="light">{t('home.point1.description')}</p>
                                </div>
                            </div>

                            <div class="col s12 m4">
                                <div class="icon-block">
                                    <h2 class="center deep-purple-text darken-2"><i class="material-icons">group</i></h2>
                                    <h5 class="center">{t('home.point2.title')}</h5>
                                    <p class="light">{t('home.point2.description')}</p>
                                </div>
                            </div>

                            <div class="col s12 m4">
                                <div class="icon-block">
                                    <h2 class="center deep-purple-text darken-2"><i class="material-icons">settings</i></h2>
                                    <h5 class="center">{t('home.point3.title')}</h5>
                                    <p class="light">{t('home.point3.description')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
                <div class="parallax-container valign-wrapper">
                    <div class="section no-pad-bot">
                        <div class="container">
                            <div class="row center">
                                <h5 class="header col s12 light">
                                    <a href="/map" class="waves-effect waves-light btn">View the star atlas</a>
                                </h5>
                            </div>
                        </div>
                    </div>
                    
                </div>

                <footer class="page-footer deep-purple darken-2">
                    <div class="footer-copyright">
                        <div class="container">
                            Made by <a class="brown-text text-lighten-3" href="http://materializecss.com">Materialize</a>
                        </div>
                    </div>
                </footer>
            </div>
        )
    }
}

export default withTranslation('common')(Home);