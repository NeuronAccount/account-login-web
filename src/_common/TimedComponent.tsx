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
        const {timestamp, visible, intervalMillSec} = this.props;

        this.reset();
        if (visible) {
            this.show(timestamp, intervalMillSec);
        }
    }

    public componentWillUnmount() {
        this.clearTimer();
        this.reset();
    }

    public componentWillReceiveProps(nextProps: Props) { // may called when props not changed
        const {timestamp, intervalMillSec} = nextProps;
        if (timestamp === this.state.timestamp) {
            return;
        }

        this.clearTimer();
        this.show(timestamp, intervalMillSec);
    }

    public render() {
        return (
            <div>
                {this.state.visible ? this.props.contentElement : null}
            </div>
        );
    }

    private reset() {
        this.setState({
            timer: 0,
            timestamp: this.props.timestamp,
            visible: false
        });
    }

    private clearTimer() {
        const timer = this.state.timer;
        if (timer !== 0) {
            clearInterval(timer);
        }
    }

    private show(timestamp: Date, intervalMillSec: number) {
        const timestampMsec = timestamp.getTime();

        if (new Date().getTime() - timestampMsec > intervalMillSec) {
            return;
        }

        const timer: number = window.setInterval(
            () => {
                if (new Date().getTime() - timestampMsec > intervalMillSec) {
                    clearInterval(timer);
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
            timer,
        });
    }
}
