const productionEnv = true;

console.info(`enviroment: ${productionEnv?'production':'development'}`)

export default {
  url: productionEnv ? 'http://180.167.255.78:1027/' : 'http://10.11.5.183:1027/',
  checkProjectStatus: 'http://180.167.255.78:32040/'
}
































