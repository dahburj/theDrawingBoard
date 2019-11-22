import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Owner from './Owner';
import Attendee from './Attendee';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  active: {
    backgroundColor: 'orange'
  },
  scheduled: {
    backgroundColor: 'white'
  }
}));

export default function MeetingCard(props) {

  const classes = useStyles();

  const [activeMeeting, setActiveMeeting] = useState(props.active);

  const handleChange = panel => (event, isExpanded) => {
    props.setExpanded(isExpanded ? panel : false);
  };

  const startMeeting = () => {
    props.socket.emit('startMeeting', {id: props.id});
  };

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.on('meetingStarted', () => {
        console.log(activeMeeting);
        setActiveMeeting(true);
      })

      return () => {
        props.socket.off('meetingStarted');
      };
    }
  }, [props.socket, props.socketOpen, activeMeeting]);

  return (
    <div className={classes.root}>
      <ExpansionPanel className={activeMeeting ? classes.active : classes.scheduled} expanded={props.expanded === `panel${props.id}`} onChange={handleChange(`panel${props.id}`)}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel${props.id}bh-content`}
          id={`panel${props.id}bh-header`}
        >
          <Typography className={classes.heading}>{props.startTime}</Typography>
          <Typography className={classes.secondaryHeading}>{props.name}</Typography>
          <Typography variant="body2" component="p">{props.owner}</Typography>
          <Typography variant="body2" component="p">{props.attendees.length} Attendees</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography variant="body2" component="p">
            Description: {props.description}
          </Typography>
          <Typography variant="body2" component="p">Attendees</Typography>
            <ul>
              {props.attendees.map((attendee, index) => (<li key={index}>{attendee}</li>))}
            </ul>
          {props.user === props.owner ? <Owner id={props.id} socket={props.socket} startMeeting={startMeeting}/> : <Attendee />}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}
