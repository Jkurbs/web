
import React, { Component } from 'react';
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native';

const styles = StyleSheet.create({

    orderModal:{
        position:'absolute',
        backgroundColor: 'skyblue',
        width: '200px',
        height: '200px',
        top:'60px',
        right:'13px',
        zIndex:'1000'
    }



})




class CalendarModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
          showCalendar: this.props.show
        }
      }

    componentWillReceiveProps(){
        this.setState({showCalendar:this.props.show})
    }
  
    hideModal = () => {
    this.setState({ showCalendar: false });
    }

    ///ORDERCALENDAR MODAL
    OrderCalendar = ({ handleClose, show, children }) => {
        if(show){
        return (
            <View style={styles.orderModal}>           
                <button
                onClick={handleClose}
                >
                Close
                </button>
            </View>
        );
        } else{
            return (<></>)
        }
        };
    ///ORDERCALENDAR MODAL END

    render(){
        return (
            <this.OrderCalendar show={this.state.showCalendar} handleClose={this.hideModal} />
        )
    }
}

export default CalendarModal;