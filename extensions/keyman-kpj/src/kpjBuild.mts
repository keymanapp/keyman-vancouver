/*
 * Keyman is copyright (C) SIL Global. MIT License.
 */


/**
 * Code related to building KPJ projects
 */

import { KPJFileReader, CompilerCallbacks, CompilerEvent } from "@keymanapp/common-types";
import { ExtensionCallbacks } from "./extensionCallbacks.mjs";

export async function buildProject(workspaceRoot: string,
    kpjPath: string, msg: (m: string)=>void): Promise<void> {

    const callbacks = new ExtensionCallbacks({}, msg);
    // const outfile = '';
    // const coptions : CompilerCallbackOptions = {
    // };
    // const options : CompilerOptions = {
    // };
    // const callbacks = new NodeCompilerCallbacks(coptions);

    // const resp = await (new BuildProject().build(
    // 	infile,
    // 	<string><unknown>undefined,
    // 	callbacks,
    // 	options
    // ));

    // // dump all
    // callbacks.messages?.forEach(m => console.dir(m));
    // const resp = false;

    // return resp;

    msg(`Keyman Vancouver: Begin build of ${kpjPath}…\r\n`);

    const reader = new KPJFileReader(callbacks);

    const prj = reader.read(callbacks.fs.readFileSync(kpjPath));

    if (!prj) {
        msg(`Could not load ${kpjPath}`);
        return;
    }

    msg(`PRJ loaded: ${JSON.stringify(prj, null, ' ')}\r\n`);


    msg(`All done.\r\n`);
    return;
}
