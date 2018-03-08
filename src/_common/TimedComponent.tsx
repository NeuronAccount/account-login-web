import * as React from 'react';

export interface Props {
    contentElement: JSX.Element;
    timestamp: Date;
    intervalMillSec: number;
    visible: boolean;
}

interface State {
    timer: number;
    timestamp: Date;
    visible: boolean;
}

export default class TimedComponent extends React.Component<Props, State> {
    public componentWillMount() {
        this.setState({
            timer: 0,
            timestamp: this.props.timestamp,
            visible: false
        });

        if (this.props.visible) {
            this.show(this.props.timestamp, this.props.intervalMillSec);
        }
    }

    public componentWillUnmount() {
        if (this.state.timer !== 0) {
            clearInterval(this.state.timer);
        }

        this.setState({
            timer: 0,
            timestamp: this.props.timestamp,
            visible: false
        });
    }

    public componentWillReceiveProps(nextProps: Props) {
        // may called when props not changed
        if (nextProps.timestamp === this.state.timestamp) {
            return;
        }

        if (this.state.timer && this.state.timer !== 0) {
            clearInterval(this.state.timer);
        }

        this.show(nextProps.timestamp, nextProps.intervalMillSec);
    }

    public render() {
        return (
            <div>
                {this.state.visible ? this.props.contentElement : null}
            </div>
        );
    }

    private show(timestamp: Date, intervalMillSec: number) {
        if (new Date().getTime() - timestamp.getTime() > intervalMillSec) {
            return;
        }

        const t: number = window.setInterval(
            () => {
                if (new Date().getTime() - timestamp.getTime() > intervalMillSec) {
                    clearInterval(t);
                    this.setState({
                        visible: false,
                        timer: 0
                    });
                }
            },
            200);

        this.setState({
            visible: true,
            timestamp,
            timer: t,
        });
    }
}
