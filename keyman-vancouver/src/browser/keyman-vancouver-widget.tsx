/*
 * Keyman is copyright (C) SIL Global. MIT License.
 */

import { CommandService, MessageService } from "@theia/core";
import { ReactWidget } from "@theia/core/lib/browser";
import { inject, injectable, postConstruct } from "@theia/core/shared/inversify";
import { ReactNode } from 'react';
import React = require("react");
@injectable()
export class KeymanVancouverGettingStarted extends ReactWidget {
    static readonly ID = 'KeymanVancouver.GettingStartedWidget';
    static readonly LABEL = 'Getting Started with Keyman Vancouver';

    @postConstruct()
    protected init(): void {
        this.id = KeymanVancouverGettingStarted.ID;
        this.title.caption = this.title.label = KeymanVancouverGettingStarted.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-window-maximize';
        this.update();
    }

    protected render(): ReactNode {
        const header = KeymanVancouverGettingStarted.LABEL;
        return <div id='widget-container'>
            <h1>{header}</h1>

            <div className="vancouver-splash">&nbsp;</div>

            <h2>Get Started!</h2>
            <p>
                It's time to get started… let's create or open a project.
            </p>

                {/* <AlertMessage type='INFO' header={header} /> */}
                <button className='theia-button secondary' title='Open Project…' onClick={_a => this.openProject()}>Open Project</button>
          </div>
    }

    @inject(CommandService)
    protected readonly commandService!: CommandService;


    @inject(MessageService)
    protected readonly messageService!: MessageService;

    protected openProject(): void {
        this.commandService.executeCommand("workbench.action.files.openFolder");
    }
    // protected openRecent(): void {
    //     this.commandService.executeCommand("workbench.action.files.openRecent");
    // }

};
