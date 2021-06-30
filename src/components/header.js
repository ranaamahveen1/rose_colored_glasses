import React, { Component } from 'react';
import '../App.css';
import { Link } from "react-router-dom";
import logo from '../realtor_logo.png';


export default class Header extends Component {
    render() {
        const site = this.props.headerData
        return (
            <React.Fragment>
                {
                    site &&
                    <React.Fragment>
                        <div>
                            <Link to="/">
                                <img src={logo} className="App-headerImg" alt="Realtor-logo" />
                            </Link>
                        </div>
                        <div>
                            <div className="header-title">{site.title}</div>
                        </div>
                    </React.Fragment>
                }
            </React.Fragment>
        );
    }
}
