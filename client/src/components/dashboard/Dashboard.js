import React, { useState, useEffect } from 'react';

import './Dashboard.scss';

import MeetingCard from './MeetingCard';
import FormDialog from './FormDialog';


export default function Dashboard(props) {

  const currentUser = props.user;

  const [meetings, setMeetings] = useState([]);
  const [expanded, setExpanded] = useState(false);

  // const handleMeetings = () => {

  // };

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.emit('fetchMeetings', { username: currentUser.username, meetingStatus: 'scheduled' });
      props.socket.on('meetings', data => {
        // console.log('handling')
        setMeetings(data)
      });

      props.socket.on('itWorkedThereforeIPray', data => {
        console.log('new meeting', data);
        setMeetings(prev => [...prev, data]);
      });

      props.socket.on('meetingDeleted', (res) => {
        console.log('meeting deleted', res);
        setMeetings(prev => prev.filter(meeting => meeting.id !== res.id));
      });

      // props.socket.on('meetingStarted', () => {

      // })

      return () => {
        props.socket.off('meetings');
        props.socket.off('itWorkedThereforeIPray');
        props.socket.off('meetingDeleted');
      };
    }
  }, [props.socket, props.socketOpen, currentUser.username]);

  // const startMeeting = () => {
  //   props.socket.emit('startMeeting', {id: props.id});
  // };
  // console.log('meetings:', meetings)
  const meetingsList = meetings.map(meeting => {
    return (
      <li className='meeting-list-item' key={meeting.id}>
        <MeetingCard
          id={meeting.id}
          startTime={meeting.start_time}
          name={meeting.name}
          owner={meeting.owner_username}
          attendees={meeting.invited_users}
          attendeeIds={meeting.attendee_ids}
          description={meeting.description}
          active={meeting.active}
          user={currentUser}
          expanded={expanded}
          setExpanded={setExpanded}
          socket={props.socket}
          socketOpen={props.socketOpen}
          setInMeeting={props.setInMeeting}
          setMeetingId={props.setMeetingId}
          setOwnerId={props.setOwnerId}
          setBackgroundImage={props.setBackgroundImage}
          setImageLoaded={props.setImageLoaded}
          setInitialPixels={props.setInitialPixels}
        />
      </li>
    )
  });

  return (
    <div>
      <h1>Upcoming Meetings</h1>
      <FormDialog
        socket={props.socket}
        socketOpen={props.socketOpen}
        user={currentUser}
      />
      <ul className='meeting-list'>
        {meetingsList}
      </ul>
    </div>
  );
}
