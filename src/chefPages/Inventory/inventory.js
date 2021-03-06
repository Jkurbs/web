import React from "react";
import styles from "./inventory.styles";
import { View, ScrollView, Animated, Dimensions } from "react-native";

import firebase from "../../firebase/Firebase";
import "firebase/firestore";

import TableView from '../../components/tableView';
import HeaderBar from '../../components/headerBar';
import Alert from '../../components/Alerts/alert';
import InventoryRightSideBar from '../../components/InventoryRightSidebar';

var db = firebase.firestore();
const ref = db.collection('chefs')

const getWidth = Dimensions.get('window').width - 200;

class Inventory extends React.Component {

    constructor() {
        super();
        this.child = React.createRef();
        this.state = {
            userID: firebase.auth().currentUser.uid,
            tableHead: ['Name', 'Quantity', 'Unit', 'Actions'],
            tableData: [],
            filteredTableData: [],
            filteredRealData: [],
            item: {},
            data: [],
            value: '',
            hasData: null,
            isSearching: false,
            isAlertVisible: false,
            isInvModalActive: false,
            interpolateBar: this.animVal.interpolate({ inputRange: [0, 1], outputRange: [getWidth, getWidth - 397] }),
            windowWidth: "",
            mode: 'Add',
        };
        this.addInventoryItem = this.addInventoryItem.bind(this);
    }

    animVal = new Animated.Value(0);

    animatedTransitionShrink = Animated.spring(this.animVal, { toValue: 1 })
    animatedTransitionGrow = Animated.spring(this.animVal, { toValue: 0 })

    componentDidMount() {
        let currentComponent = this;
        // Fetch Current chef 
        ref.doc(this.state.userID).collection("inventory").onSnapshot(function (querySnapshot) {
            currentComponent.setState({ tableData: [], data: [] })

            if (querySnapshot.empty) {
                currentComponent.setState({
                    hasData: false,
                });
            } else {
                querySnapshot.forEach(function (doc) {
                    const data = doc.data()
                    const detValues = [data.key, data.dateAdded, data.name]
                    let currentData = [...currentComponent.state.data]
                    currentData.push(detValues)
                    const propertyValues = [data.name, data.quantity, data.unit, '']
                    let currentTableData = [...currentComponent.state.tableData];
                    currentTableData.push(propertyValues);
                    currentComponent.setState({
                        data: currentData,
                        tableData: currentTableData,
                        hasData: true,
                    });
                });
            }
        });
        let getWidth = ''
        window.addEventListener('resize', function () {
            // your custom logic
            getWidth = Dimensions.get('window').width - 200;
            currentComponent.setState({
                interpolateBar: currentComponent.animVal.interpolate({ inputRange: [0, 1], outputRange: [getWidth, getWidth - 397] })
            })
        });
    }

    // Handle inventory details mode 
    handleMode = (mode) => {
        this.setState({
            mode: mode
        })
    }

    // Show Iventory item details 
    handleDetails = (item) => {
        this.setState({
            item: item,
            mode: 'Details'
        })
    };

    // Add new inventory item
    addInventoryItem = (item) => {

        this.setState(state => {
            const data = [item, ...state.data];
            return {
                data,
                value: item,
                item: item
            };
        });
        ref.doc(this.state.userID).collection("inventory").add(
            item
        )
        this.handleMode("Details")
    };

    // Update inventory Item 
    updateInventoryItem = (item) => {
        this.setState(state => {
            const data = state.data.map((previousItem, j) => {
                if (j === item) {
                    return item;
                } else {
                    return previousItem;
                }
            });
            return {
                data,
            };
        });
        // Update menu item in Firebase 
        let currentComponent = this
        ref.doc(this.state.userID).collection("inventory").where('key', '==', item.key).get().then(function (snapshot) {
            snapshot.forEach(function (doc) {
                ref.doc(currentComponent.state.userID).collection("inventory").doc(doc.id).update(item)
            })
        })
    };

    // Delete menu Item 
    deleteInventoryItem = () => {

        const item = this.state.item

        // TODO: - Delete menu item in Firebase
        let currentComponent = this
        ref.doc(this.state.userID).collection("inventory").where('key', '==', item.key).get().then(function (snapshot) {
            snapshot.forEach(function (doc) {
                console.log(doc.id)
                ref.doc(currentComponent.state.userID).collection("inventory").doc(doc.id).delete()
            })
        })

        const itemF = [item.name, item.quantity, item.unit, ""]

        this.setState(state => {
            const filteredData = state.filteredTableData.filter(otherItem => otherItem[0] !== itemF[0]);
            return {
                filteredTableData: filteredData
            };
        });

        this.setState({ isAlertVisible: !this.state.isAlertVisible })
        if (this.state.isInvModalActive == true) {
            this.showInventoryModal()
        }
    };

    didSelectCell = (selectedIndex) => {
        this.handleMode("Details")
        let tableD = this.state.tableData
        let realD = this.state.data
        // IF SEARCH IS ON GET DATA FROM FILTERED
        if (this.state.isSearching === true) {
            tableD = this.state.filteredTableData
            realD = this.state.filteredRealData
        }
        let item = {
            name: tableD[selectedIndex][0],
            quantity: tableD[selectedIndex][1],
            unit: tableD[selectedIndex][2],
            dateAdded: realD[selectedIndex][1],
        }

        this.handleDetails(item)
        if (this.state.isInvModalActive === false) {
            this.showInventoryModal()
        }
    }

    leftActionSelected = (selectedIndex) => {
        this.handleMode("Edit")
        let tableD = this.state.tableData
        let realD = this.state.data
        // IF SEARCH IS ON GET DATA FROM FILTERED
        if (this.state.isSearching === true) {
            tableD = this.state.filteredTableData
            realD = this.state.filteredRealData
        }
        let item = {
            name: tableD[selectedIndex][0],
            quantity: tableD[selectedIndex][1],
            unit: tableD[selectedIndex][2],
            dateAdded: realD[selectedIndex][1],
            key: realD[selectedIndex][0]
        }
        this.setState({
            item: item
        })

        if (this.state.isInvModalActive === false) {
            this.showInventoryModal()
        }
    }

    middleActionSelected = (item, selectedIndex) => {
        let tableD = this.state.tableData
        let realD = this.state.data
        // IF SEARCH IS ON GET DATA FROM FILTERED
        if (this.state.isSearching === true) {
            tableD = this.state.filteredTableData
            realD = this.state.filteredRealData
        }
        let itemSelect = {
            name: tableD[selectedIndex][0],
            quantity: tableD[selectedIndex][1],
            unit: tableD[selectedIndex][2],
            key: realD[selectedIndex][0],
            dateAdded: realD[selectedIndex][1],
        }
        this.setState({ item: itemSelect, isAlertVisible: !this.state.isAlertVisible })
    }

    cancelAlert = () => {
        this.setState({ isAlertVisible: !this.state.isAlertVisible })
    }

    rightActionSelected = (selectedIndex) => {
        this.handleMode("Details")
        if (this.state.isInvModalActive === false) {
            this.showInventoryModal()
        }
    }

    showCalendarModal = () => {
        this.setState({ showCalendar: !this.state.showCalendar });
    }

    //for the "Add your first item" button
    addFirst = () => {
        this.handleMode("Add")
        if (this.state.isInvModalActive === false) {
            this.showInventoryModal()
        }
    }


    showInventoryModal = () => {
        if (this.state.isInvModalActive === true) {
            this.setState({ isInvModalActive: false })
            this.child.current.handleSlide(true);
            this.animatedTransitionGrow.start();
        } else {
            this.setState({ isInvModalActive: true })
            this.child.current.handleSlide(false);
            this.animatedTransitionShrink.start();
        }
    }

    search = (searchTerm) => {
        let filteredData = this.state.tableData.filter(dataRow => dataRow[0].toLowerCase().includes(searchTerm));
        let filteredReal = this.state.data.filter(dataRow => dataRow[2].toLowerCase().includes(searchTerm));
        this.setState({
            isSearching: true,
            filteredTableData: filteredData,
            filteredRealData: filteredReal
        });
        if (searchTerm.length === 0) {
            this.setState({
                isSearching: false,
                filteredTableData:
                    ["No result ", "try something else",]
                ,
            });
        }
    }

    handleWidth = () => {
        let { isActive, translateX } = this.state;
        Animated.spring(translateX, {
            toValue: isActive ? -420 : 0,
            duration: 20
        }).start(finished => {
            this.setState((prevState, props) => ({
                isActive: !prevState.isActive,
            }));
        });
    };

    render() {
        return (
            <View style={styles.container}>
                <HeaderBar
                    title={"Inventory"}
                    subtitle={this.state.tableData.length}
                    search={this.search.bind(this)}
                    isSearchEnabled={true}
                    showCalendar={this.showCalendarModal.bind(this)}
                    showInv={this.showInventoryModal.bind(this)}
                    handleMode={this.handleMode.bind(this)}
                    isModalActive={this.state.isInvModalActive}
                />
                <ScrollView>
                    <Animated.View style={{ width: this.state.interpolateBar }}>
                        <TableView
                            tableHead={this.state.tableHead}
                            tableData={this.state.isSearching ? this.state.filteredTableData : this.state.tableData}
                            hasData={this.state.hasData}
                            hasImage={false}
                            didSelectCell={this.didSelectCell.bind(this)}
                            leftImage={require('../../assets/icon/edit.png')}
                            middleImage={require('../../assets/icon/remove-100.png')}
                            rightImage={require('../../assets/icon/info-100.png')}
                            leftAction={this.leftActionSelected.bind(this)}
                            middleAction={this.middleActionSelected.bind(this)}
                            rightAction={this.rightActionSelected.bind(this)}
                            action={this.addFirst.bind(this)}
                        />
                    </Animated.View>
                </ScrollView>
                <InventoryRightSideBar
                    isActive={this.state.isInvModalActive}
                    showInv={this.showInventoryModal.bind(this)}
                    mode={this.state.mode}
                    ref={this.child}
                    handleMode={this.handleMode.bind(this)}
                    item={this.state.item}
                    addInventoryItem={this.addInventoryItem}
                    updateInventoryItem={this.updateInventoryItem}
                    handleDetails={this.handleDetails}
                />
                <Alert
                    cancelAction={this.cancelAlert.bind(this)}
                    deleteAction={this.deleteInventoryItem.bind(this)}
                    isVisible={this.state.isAlertVisible}
                    buttonTitle1={"Delete from inventory"} />
            </View>
        );
    }
}

export default Inventory;
