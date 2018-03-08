import * as React from 'react';
import TimedComponent from './TimedComponent';

export interface TextTimestamp {
    text: string;
    timestamp: Date;
}

export interface Props extends TextTimestamp {
    intervalMillSec: number;
    style?: React.CSSProperties;
}

export default class TimedText extends React.Component<Props> {
    public render() {
        const visible = this.props.text !== '';

        return (
            <div>
                <TimedComponent
                    contentElement={this.renderText()}
                    timestamp={this.props.timestamp}
                    intervalMillSec={this.props.intervalMillSec}
                    visible={visible}/>
            </div>
        );
    }

    private renderText(): JSX.Element {
        return (
            <label style={this.props.style}>{this.props.text}</label>
        );
    }
}