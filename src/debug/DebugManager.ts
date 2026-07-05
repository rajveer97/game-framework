import type { Application } from "pixi.js";
import { initDevtools } from "@pixi/devtools";

export class DebugManager {
    static initialize(app: Application){
        if(!import.meta.env.DEV) return;
        initDevtools({app,});
    }
}