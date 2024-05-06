// import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

// importações usadas no Storage conforme a doc 
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

// importações para a conexão com o banco conforme a doc
import { storage, fire } from "../Firebase";
import { collection, onSnapshot } from 'firebase/firestore';

export default function Home() {

    // Perguntar se as variaveis estão salvas no banco
    const [img, setImg] = useState("");
    const [file, setFile] = useState("");

    // sintaxe para a manipulação dos dados
    useEffect(() => {

        const unsubscribe = onSnapshot(collection(fire, "files"), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    setFile((prevFiles) => [...prevFiles, change.doc.data()]);
                }
            });
        });

        return () => unsubscribe();

    }, []);

    // função para subir as imagens
    async function uploadImage(uri, fileType){

        // revisa se a uri 
        const response = await fetch(uri);
        // revisa se o blob
        const blob = await response.blob();
        const storageRef = ref(storage, "");
        const uploadTask = uploadBytesResumable(storageRef, blob);
        
        uploadTask.on(
            "state_changed",
            (snapshot) =>{
                getDownloadURL(uploadTask.snapshot.ref).then(async (getDownloadURL) =>{
                    await saveRecord(fileType, getDownloadURL, new Date().toISOString());
                    setImg("");
                });
            }
        )
    }

    async function saveRecord(fileType, url, createAt){
        try{
            const docRef = await addDoc(collection, (fire, "files"),{
                fileType,
                url,
                createAt,
            })
        }catch(e){
            console.log(e);
        }
    }

        return(

                <SafeAreaView>
                
                    <View>
                        <Text> Minhas fotos </Text>

                        <FlatList
                        data={file}
                        keyExtractor={(item)=>item.url}
                        renderItem={({item}) =>{
                            if(item.fileType == "img")
                                {
                                    return (
                                        <Image
                                            source={{uri:item.url}}
                                            style={styles.fotos}
                                        />
                                    )
                                }
                        }

                        }
                        numColumns={2}
                        
                        />
                    
                    </View>
                
                </SafeAreaView>

        );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotos:{
    width:'90%',
    height:'50%' 
  }
});