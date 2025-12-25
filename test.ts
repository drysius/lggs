import Lggs, { ConsolePlugin, RegisterPlugin } from "./src/lggs";

const logger = new Lggs({
    plugins:[]
});

const logger2 = logger.config({
    plugins:[RegisterPlugin]
})

logger2.config({
    
})

logger2.plugin(ConsolePlugin({
    
}), {
    
})