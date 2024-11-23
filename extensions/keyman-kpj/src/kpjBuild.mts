/*
 * Keyman is copyright (C) SIL Global. MIT License.
 */


/**
 * Code related to building KPJ projects
 */

/**
 * TODO Some of this code may  look very familiar and should be refactored from kmc !
 */

import { extname, dirname } from "node:path";
import { mkdir } from "node:fs/promises";
import { KPJFileReader, CompilerCallbacks, CompilerEvent, KeymanFileTypes, CompilerCallbackOptions, CompilerOptions, LDMLKeyboardXMLSourceFileReader } from "@keymanapp/common-types";
import { ExtensionCallbacks } from "./extensionCallbacks.mjs";
import * as kmcLdml from '@keymanapp/kmc-ldml';
import { fileURLToPath } from 'url';
import { KmpCompiler, KmpCompilerOptions } from "@keymanapp/kmc-package";

async function mkParentDirs(filePath: string) {
    const dir = dirname(filePath);
    await mkdir(dir, { recursive: true });
}

export async function buildProject(workspaceRoot: string,
    kpjPath: string, msg: (m: string)=>void): Promise<void> {

    const callbacks = new ExtensionCallbacks({}, msg);

    // const outfile = '';
    const coptions : CompilerCallbackOptions = {
    };
    const options : CompilerOptions = {
    };
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
        msg(`Could not load ${kpjPath}\r\n`);
        return;
    }
    try {
        reader.validate(prj);
    } catch(e) {
        console.error(e);
        msg(`Error validating ${kpjPath}\r\n`);
    }

    // we don't need to see it.
    // msg(`PRJ loaded: ${JSON.stringify(prj, null, ' ')}\r\n`);

    // this next line is important - we need the full (?) project
    // otherwise we get an empty shell
    const project = await reader.transform(kpjPath, prj);
    // msg(`project loaded: ${JSON.stringify(project, null, ' ')}\r\n`);

    let didCompileSrc = false;
    let didCompilePkg = false;

    for (const path of project.files.filter(({ filePath }) => extname(filePath) === KeymanFileTypes.Source.LdmlKeyboard)) {
        const { filePath } = path;
        msg(`Compiling LDML: ${filePath}\r\n`);

        const ldmlCompilerOptions: kmcLdml.LdmlCompilerOptions = {
            ...options, readerOptions: {
                importsPath: fileURLToPath(new URL(...LDMLKeyboardXMLSourceFileReader.defaultImportsURL))
            }
        };
        const compiler = new kmcLdml.LdmlKeyboardCompiler();
        if (!await compiler.init(callbacks, ldmlCompilerOptions)) {
            msg(`Compiler failed init\r\n`);
            continue;
        }

        const outfile = project.resolveOutputFilePath(path, KeymanFileTypes.Source.LdmlKeyboard, KeymanFileTypes.Binary.Keyboard);
        msg(`.. outfile is ${outfile}\r\n`);
        await mkParentDirs(outfile);
        const result = await compiler.run(filePath, outfile);
        if (!result) {
            msg(`Compiler failed to run\r\n`);
            continue;
        }
        msg(`.. compiled\r\n`);
        // if(!this.createOutputFolder(outfile ?? infile, callbacks)) {
        //             return false;
        // }

        if (!await compiler.write(result.artifacts)) {
            msg(`Error writing ${outfile}\r\n`);
            throw Error(`Error writing ${outfile}`);
        }

        msg(`.. wrote\r\n`);
    
        msg(`\r\n\r\n`);
        didCompileSrc = true; // we allow more than one xmk in each package
    }

    // now, compile any .kmn
    for (const path of project.files.filter(({ filePath }) => extname(filePath) === KeymanFileTypes.Source.KeymanKeyboard)) {
        msg(`TODO: Sorry, don't yet compile .kmn such as ${path.filePath} ..`);
    }

    // check errs and get out

    if(callbacks.hasFailureMessage(false)) {
        throw Error(`Error building ${kpjPath}`);
    }

    if (!didCompileSrc) {
        throw Error(`Error: no source files were compiled.`);
    }


    // now, any packaging
    for (const path of project.files.filter(({ filePath }) => extname(filePath) === KeymanFileTypes.Source.Package)) {
        const { filePath } = path;
        const kmpCompilerOptions: KmpCompilerOptions = {
            ...options
        };
        const outfile = project.resolveOutputFilePath(path, KeymanFileTypes.Source.Package, KeymanFileTypes.Binary.Package);
        await mkParentDirs(outfile);
        msg(`Packaging: ${filePath} into ${outfile}\r\n`);

        const compiler = new KmpCompiler();
        if (!await compiler.init(callbacks, kmpCompilerOptions)) {
            msg(`Compiler failed init\r\n`);
            continue;
        }

        const result = await compiler.run(filePath, outfile);
        if (!result) {
            msg(`Compiler failed to run\r\n`);
            continue;
        }
        msg(`.. compiled\r\n`);

        if (!await compiler.write(result.artifacts)) {
            msg(`Error writing ${outfile}\r\n`);
            throw Error(`Error writing ${outfile}`);
        }

        msg(`.. wrote\r\n`);
    
        msg(`\r\n\r\n`);

    }

    msg(`All done.\r\n`);
    return;
}
