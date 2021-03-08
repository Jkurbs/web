import React, { useState, useEffect } from "react";
import styles from "./menu.styles";
import { View, ScrollView } from "react-native";
import firebase from "../../firebase/Firebase";
import "firebase/firestore";
import TableView from "../../components/tableView";
import HeaderBar from "../../components/headerBar";
import Modal from "modal-enhanced-react-native-web";

var db = firebase.firestore();
const ref = db.collection("chefs");
const menuDetailsName = "MenuDetails";

const SearchComponent = ({ buttonAction, subtitle, search }) => (
  <HeaderBar
    title={"Menu"}
    buttonAction={() => buttonAction()}
    subtitle={subtitle}
    search={(term) => {
      search(term);
    }}
    isSearchEnabled={true}
  />
);

function Menu(props) {
  const navigation = props.navigation;
  const userID = firebase.auth().currentUser.uid;

  const [tableHead] = useState([
    "Image",
    "Name",
    "Price",
    "Category",
    "Actions",
  ]);
  const [tableData, setTableData] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [filteredFullData, setFilteredFullData] = useState([]);
  const [item, setItem] = useState({});
  const [hasData, setHasData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [visibleModal, setVisibleModal] = useState(null);
  const menuRef = ref.doc(userID).collection("menu");

  // Fetch Menu
  useEffect(() => {
    async function fetchData() {
      menuRef.onSnapshot(function (querySnapshot) {
        if (querySnapshot.empty) {
          setHasData(false);
        } else {
          querySnapshot.forEach(function (doc) {
            const data = doc.data();
            const propertyValues = [
              data.imageURL,
              data.name,
              `$${data.price}`,
              data.group,
              null,
            ];
            setTableData((prevState) => [...prevState, propertyValues]);
            setFullData((prevState) => [...prevState, data]);
            setHasData(true);
          });
        }
      });
    }
    fetchData();
  }, []);

  // MARK: - Functions

  const deleteAction = () => {
    setVisibleModal(true);
    // if (isSearching === true) {
    //   fullData = tfilteredFullData;
    // }
    // let newItem = {
    //   ...fullData[selectedIndex],
    //   key: fullData[selectedIndex].key,
    //   image: fullData[selectedIndex].imageURL,
    // };
    // handleDetails(newItem);
    // setItem(newItem);
    // setIsAlertVisible(true);
  };

  const addItem = () => {
    navigation.navigate(menuDetailsName, { mode: "add" });
  };

  const editAction = (data) => {
    const item = fullData.filter((item) => item.name === data[1])[0];
    navigation.navigate(menuDetailsName, { mode: "edit", item: item });
  };

  const detailsAction = (data, selectedItem) => {
    var item;
    if (data) {
      item = fullData.filter((item) => item.name === data[1])[0];
    }

    navigation.navigate(menuDetailsName, {
      mode: "details",
      item: selectedItem ?? item,
    });
  };

  // Called when cell is selected
  const didSelectCell = (item, selectedIndex) => {
    if (isSearching === true) {
      fullData = filteredFullData;
    }
    item = {
      ...fullData[selectedIndex],
      image: fullData[selectedIndex].imageURL,
    };
    detailsAction(null, item);
  };

  // MARK: - Item actions

  const search = (searchTerm) => {
    let filteredData = tableData.filter((dataRow) =>
      dataRow[1].toLowerCase().includes(searchTerm)
    );
    let filteredReal = fullData.filter((dataRow) =>
      dataRow.name.toLowerCase().includes(searchTerm)
    );
    setIsSearching(true);
    setFilteredTableData(filteredData);
    setFilteredFullData(filteredReal);
  };

  if (tableData != []) {
    return (
      <View style={[styles.container]}>
        <ScrollView>
          <SearchComponent
            title={"Menu"}
            buttonAction={() => addItem()}
            subtitle={tableData.length}
            search={(term) => {
              search(term);
            }}
            isSearchEnabled={true}
            hasButton={true}
          />
          <TableView
            tableType={"Menu"}
            tableHead={tableHead}
            tableData={isSearching ? filteredTableData : tableData}
            hasData={hasData}
            hasImage={true}
            didSelectCell={(item, selectedIndex) => {
              didSelectCell(item, selectedIndex);
            }}
            buttonAction={(index) => detailsAction()}
            deleteAction={(item) => deleteAction(item)}
            editAction={(index, data) => editAction(data)}
            detailsAction={(index, data) => detailsAction(data)}
          />
          {/* <Modal
            isVisible={visibleModal}
            onBackdropPress={() => setVisibleModal(false)}
          >
            {
              <View>
                <Text>TEst</Text>
              </View>
            }
          </Modal> */}
        </ScrollView>
      </View>
    );
  }
}

export default Menu;
