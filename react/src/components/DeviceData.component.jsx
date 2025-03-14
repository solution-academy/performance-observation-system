/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import { useEffect, useState, useRef, Suspense, lazy } from "react";

import styles from "styles/component/DeviceData.module.scss";
/* 
import SimpleLineChart from "components/SimpleLineChart";
import StatWrapper from "components/StatWrapper.component";
import StatNumber from "components/StatNumber.component"; */

const SimpleLineChart = lazy(() => import("components/SimpleLineChart"));
const StatWrapper = lazy(() => import("components/StatWrapper.component"));
const StatNumber = lazy(() => import("components/StatNumber.component"));

function DeviceData(props) {
	const [name, setName] = useState("");
	const [uid, setUID] = useState("");

	const [oxy, setOxy] = useState([]);
	const [ph, setPh] = useState([]);
	const [temp, setTemp] = useState([]);
	const [sal, setSal] = useState([]);
	const [visible, setVisible] = useState(false);
	const [lastUpdate, setLastUpdate] = useState("");

	const requestData = async (id) => {
		const response = await fetch(
			`${process.env.REACT_APP_SERVER_HOSTNAME}/api/device/data?id=${id}&limit=10`
		);
		const data = await response.json();

		try {
			if (data && data.length) {
				const oxyData = data.map((d) => ({
					date: new Date(d.timestamp).getTime(),
					value: d.values.oxy,
				}));
				const phData = data.map((d) => ({
					date: new Date(d.timestamp).getTime(),
					value: d.values.ph,
				}));
				const tempData = data.map((d) => ({
					date: new Date(d.timestamp).getTime(),
					value: d.values.temp,
				}));
				const salData = data.map((d) => ({
					date: new Date(d.timestamp).getTime(),
					value: d.values.sal,
				}));

				// setLastUpdate to dd/mm/yyyy hh:mm:ss
				const l = new Date(data[0].timestamp).toLocaleString();

				setOxy(oxyData);
				setPh(phData);
				setTemp(tempData);
				setSal(salData);
				setLastUpdate(l);
			}

		} catch (e) {
			console.log(e);
		}

	};

	useEffect(() => {
		console.log(props.mqtt);

		if (!props.mqtt) return;

		if (props.mqtt.topic === "sasaqua/server/state") {
			const d = props.mqtt.message.split(":");

			if (d.length > 0) {
				if (d[0] === "UPDATE" && d[1] === name) {
					requestData(uid);
				}
			}
		}
	}, [props.mqtt]);

	useEffect(() => {
		if (!props.name) return;
		if (!props.uid) return;

		setName(props.name);
		setUID(props.uid);

		requestData(props.uid);
	}, [props.name, props.uid]);

	useEffect(() => {
		if (typeof props.visible !== "undefined") {
			setVisible(props.visible);
		}
	}, [props.visible]);

	return (
		<div className={`${styles.container} ${visible ? styles.visible : ""}`}>
			<div className={styles.header}>
				<div className={styles.status}></div>
				<div className={styles.label}>
					<div className={styles.device}>
						<div className={styles.name}>{props.name}</div>
					</div>
					<div className={styles.date}>
						Last updated at {lastUpdate}
					</div>
				</div>
			</div>
			<div className={styles.body}>
				<div className={styles.charts}>
					<div className={styles.chart}>
						<div className={styles.label}>
							<div className={styles.name}>pH</div>
							<div className={styles.value}>
								{ph.length && ph[0].value}
							</div>
						</div>
						<Suspense fallback={<div>Loading...</div>}>
							<SimpleLineChart
								data={ph}
								/* unique label string generate */
								label={`${Date.now()}${Math.random()}`}
								height={props.chartHeight}
							/>
						</Suspense>
					</div>
					<div className={styles.chart}>
						<div className={styles.label}>
							<div className={styles.name}>DO</div>
							<div className={styles.value}>
								{oxy.length && oxy[0].value}
							</div>
						</div>
						<Suspense fallback={<div>Loading...</div>}>
							<SimpleLineChart
								data={oxy}
								/* unique label string generate */
								label={`${Date.now()}${Math.random()}`}
								height={props.chartHeight}
							/>
						</Suspense>
					</div>
					<div className={styles.chart}>
						<div className={styles.label}>
							<div className={styles.name}>Temperature</div>
							<div className={styles.value}>
								{temp.length && temp[0].value}
							</div>
						</div>
						<Suspense fallback={<div>Loading...</div>}>
							<SimpleLineChart
								data={temp}
								/* unique label string generate */
								label={`${Date.now()}${Math.random()}`}
								height={props.chartHeight}
							/>
						</Suspense>
					</div>

					<div className={styles.chart}>
						<div className={styles.label}>
							<div className={styles.name}>Salinity</div>
							<div className={styles.value}>
								{sal.length && sal[0].value}
							</div>
						</div>
						<Suspense fallback={<div>Loading...</div>}>
							<SimpleLineChart
								data={sal}
								/* unique label string generate */
								label={`${Date.now()}${Math.random()}`}
								height={props.chartHeight}
							/>
						</Suspense>
					</div>
				</div>

				<div className={styles.number}>
					<Suspense fallback={<div>Loading...</div>}>
						<StatNumber
							title="pH"
							value={ph.length && ph[0].value}
							unit="pH"
							icon="BsDropletHalf"
							from="Bs"
						/>
						<StatNumber
							title="Dissolved Oxygen"
							value={oxy.length && oxy[0].value}
							unit="mg/L"
							icon="SiOxygen"
							from="Si"
						/>
						<StatNumber
							title="Temperature"
							value={temp.length && temp[0].value}
							unit="°C"
							icon="FaTemperatureLow"
						/>
						<StatNumber
							title="Salinity"
							value={sal.length && sal[0].value}
							unit="ppt"
							icon="BiWater"
							from="Bi"
						/>
					</Suspense>
				</div>
			</div>
		</div>
	);
}

export default DeviceData;
