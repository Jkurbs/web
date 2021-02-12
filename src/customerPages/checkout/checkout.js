import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, SectionList } from "react-native";
import { useTheme } from '@react-navigation/native';
import firebase from '../../firebase/Firebase'
import { Entypo } from '@expo/vector-icons';
import NavBar from '../navigation/navBar'
import useGlobalStyles  from '../storeFront/globalStyle'
import styles from '../storeFront/storeFront.lightStyle'
import OrderDone from '../checkout/orderDone'

var db = firebase.firestore();

function Checkout(props) {

  const navigation = props.navigation
  const params = props.route.params
  const chef = params.chef
  const subTotal = parseFloat((params.subTotal * 100).toFixed())
  const total = parseFloat((params.total * 100).toFixed())

  const items = params.items
  const quantity = params.quantity
  const serviceFee = params.serviceFee
  const deliveryFee = params.deliveryFee

  const [allergies, setAllergies] = useState(null)
  const [address, setAddress] = useState(null)
  const [phone, setPhone] = useState(null)
  const [email, setEmail] = useState(null)
  const [payment, setPayment] = useState(null)
  const [disable, setDisable] = useState(false)
  const [done, setDone] = useState(false)

  const globalStyles = useGlobalStyles()
  const { colors } = useTheme();

  const FlatListItemSeparator = () => {
    return ( <View style={globalStyles.border}/> )
  }

  const getData = (props) => {
    if (props === undefined) {return}
    switch(props.type) {
      case "Allergy": 
        setAllergies(props.data)
      case "Address":
        setAddress(props.data) 
        break;
      case "Phone":
        setPhone(props.data)
        break;
      case "Email":
        setEmail(props.data)
        break; 
      case "Payment":
        setPayment(props.data)
      default:
        break;
    }
  }

  const readData = (item) => {
    if (item === "Add Allergies") {
      return allergies ?? ""
    } else if (item === "Address") {
      return address?.street ?? ""
    } else if (item === "Phone Number") {
      return phone ?? ""
    } else if (item === "Email Address") {
      return email ?? ""
    } else {
      return payment?.token?.card?.last4 ?? ""
    }
  }

  const checkout = async () => {
    setDisable(true)
    const token = payment?.token?.id 
    if (token === null, address === null || email === null,
       phone === null || payment === null) 
    { setDisable(false); return }

    const ref = db.collection("payments").doc()
    await ref.set({
      chefId: chef.id,
      email: email, 
      phone: phone,
      line1: address.street, 
      city: address.city,
      state: address.state,
      zip: address.postalCode,
      subtotal: subTotal,
      total: total, 
      serviceFee: serviceFee,
      deliveryFee: deliveryFee,
      quantity: quantity,
      currency: "USD", 
      payment_method: token, 
      allergies: allergies,
      destination: chef.account_id, 
 
      // items
    }).then(function() {
        items.forEach(async (item) => { 
          ref.collection("items").doc().set({
            categoryName: item.categoryName,
            comboName:item.comboName,
            deliveryDates:item.deliveryDates,
            description:item.description ,
            imageURL: item.imageURL,
            key: item.key,
            name: item.name,
            price:item.price,
            quantity:item.quantity,
            total: item.total,
        })
      })
    }).then(function() {
      const unsubcribe = ref.onSnapshot((doc) => { 
        const status = doc.data().status
        if (status != undefined) {
          if (doc.data().status === "succeeded") {
            navigation.navigate("Order Done", {items: items, email: email})
            setDisable(false)
            unsubcribe()
          } else {
            setDisable(false)
            alert('An error occured with your card, please try again')
            unsubcribe()
            return 
          }
        } 
      })
    })
    .catch(function(error) {
        alert(error)
        setDisable(false)
    });
};




    return (
      <View style={globalStyles.backgroundPrimary}>
        <NavBar title={"Checkout"} navigation={navigation}/>

          <View style={{width: '100%',  position: "absolute", bottom: 30, flexDirection: 'column', justifyContent: 'space-between'}}>
              <TouchableOpacity onPress={()=> checkout()} style={ disable ? globalStyles.btnPrimaryDisabled : globalStyles.btnPrimary}> 
                <Text style={styles.textCentered}>{disable ? "":"Checkout"}</Text>
                <ActivityIndicator hidesWhenStopped={true} animating={disable} color={colors.textSecondary} style={{ position: 'absolute', alignSelf: 'center' }} />
              </TouchableOpacity>
              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8, bottom: 0}}>
                  <Entypo name="lock" size={12} color="#6A737D"/>
                  <Text style={globalStyles.textTertiary}>Payments are processed securely.</Text>
              </View>
          </View>
      </View>
    )
}
  
export default Checkout