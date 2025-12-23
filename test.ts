import Loggings, { ConsolePlugin, RegisterPlugin } from "./src/loggings";

const logger = new Loggings({
    
});

const logger2 = logger.config({
    
    plugins:[RegisterPlugin]
})

logger2.config({
    
})

logger2.plugin(ConsolePlugin({
    
}), {
    
})