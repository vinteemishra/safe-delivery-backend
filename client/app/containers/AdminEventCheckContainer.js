'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Card, CardTitle, CardText, CardActions } from 'react-toolbox/lib/card';
import { Input } from 'react-toolbox/lib/input'
import { Button } from 'react-toolbox/lib/button';
import { Table } from 'react-toolbox/lib/table';
import { ProgressBar } from 'react-toolbox/lib/progress_bar';
import {PUSH} from 'redux-little-router';

import {Admin} from '../lib/sdaAPI';


const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({
  push: loc => dispatch({type: PUSH, payload: loc})
});

const EventsModel = {
  eventType: {type: String, title: 'Event Type'},
  eventData: {type: String, title: 'Event Data'},
  eventTime: {type: String, title: 'Event time (phone)'},
  serverTime: {type: String, title: 'Received on server'},
  sessId: {type: String, title: 'Session id'}
};

class EventCheckContainer extends Component {
  state = {
    hasQueried: false,
    isLoading: false,
    appId: '',
    events: []
  }

  handleChange(value) {
    this.setState({appId: value});
  }

  checkEvents() {
    this.setState({events: [], isLoading: true, hasQueried: true});
    Admin.events(this.state.appId).then(events => {
      this.setState({ events, isLoading: false });
    });
  }

  onClear() {
    this.setState({isLoading: false, hasQueried: false, events: []});
  }

  formatSessionId(sessId) {
    return sessId.substring(0, 13);
  }

  formatResultCount(res) {
    // if (res.length >= 100) {
    //   return "more than 100";
    // }
    return res.length;
  }

  render() {
    const push = this.props.push;

    return (
      <section>
        <div style={{display: 'inline-block'}}>
          <Card style={{width: '350px'}}>
            <CardTitle title="Event Check" />
            <CardText>
              Enter AppId and get the last 5000 events received:
              <Input label='AppId' name='appId' value={this.state.appId} onChange={this.handleChange.bind(this)} />
            </CardText>
            <CardActions>
              <Button raised label="Find events" onClick={this.checkEvents.bind(this)}/>
              <Button raised label="Clear" onClick={this.onClear.bind(this)}/>
            </CardActions>
          </Card>
        </div>
        <div style={{marginTop: 30}}>
          {this.state.isLoading &&
            <ProgressBar type="circular" mode="indeterminate" />
          }
          {(this.state.hasQueried && !this.state.isLoading) &&
            <div>
              <div style={{marginBottom: 20}}>Found {this.formatResultCount(this.state.events)} events.</div>
              <Table
                model={EventsModel}
                selectable={false}
                source={this.state.events}
              />
            </div>
          }
        </div>
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventCheckContainer);
