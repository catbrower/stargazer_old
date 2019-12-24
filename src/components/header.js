import React from 'react';
import {withTranslation} from 'react-i18next';
import M from 'materialize-css';

class Header extends React.Component {
    componentDidMount() {
        M.Sidenav.init(this.sidenav);
    }

    render() {
        const {t} = this.props;

        return (
            <nav class="deep-purple darken-2 white-text" role="navigation">
                <div class="nav-wrapper container">
                    <a id="logo-container" href="#" class="brand-logo"></a>
                    <ul class="right hide-on-med-and-down">
                        <li><a href="/map" class="white-text">{t('header.map')}</a></li>
                        <li><a href="/" class="white-text">{t('header.home')}</a></li>
                    </ul>
                    

                    <ul id="nav-mobile" ref={(sidenav) => {this.sidenav = sidenav}} class="sidenav">
                        <li><a href="/map" class="black-text">{t('header.map')}</a></li>
                        <li><a href="/" class="black-text">{t('header.home')}</a></li>
                    </ul>

                    <a href="#" data-target="nav-mobile" class="sidenav-trigger">
                        <i class="material-icons">
                            menu
                        </i>
                    </a>
                </div>
            </nav>
        )
    }
}

export default withTranslation('common')(Header);