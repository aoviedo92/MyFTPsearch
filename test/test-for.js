arg = "c"
data = ["a","b","c"]
datos_nuevos = []
data.forEach(function (elem, index) {
    if(elem == arg){
        datos_nuevos.push(arg)
    }else{
        datos_nuevos.push(elem)
    }
    console.log(datos_nuevos)
});
console.log(datos_nuevos)
