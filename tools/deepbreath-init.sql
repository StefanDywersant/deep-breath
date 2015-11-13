--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: deepbreath-tst
--

INSERT INTO countries VALUES ('5b1fcf1a-a351-4007-900e-64e74650f97f', 'Poland', 'pl');


--
-- Data for Name: datasources; Type: TABLE DATA; Schema: public; Owner: deepbreath-tst
--

INSERT INTO datasources VALUES ('8d8e4c09-5201-466d-9936-b358d7a72b99', 'pl-wielkopolskie');


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: deepbreath-tst
--

INSERT INTO units VALUES ('abf353ee-741f-4886-8c83-022a5eefea46', '%.2f µg/m³');
INSERT INTO units VALUES ('171604b3-e810-4a1b-8eb8-6a2b22f7a6bd', '%.2f ⁰C');
INSERT INTO units VALUES ('8ae383ef-722a-403f-8879-93baf669cd1f', '%.2f hPa');
INSERT INTO units VALUES ('cc82a78e-8f55-4528-910f-718eedac4b50', '%.2f \%');
INSERT INTO units VALUES ('6530a1a6-a3e1-42f0-9372-75d6e29be545', '%.2f m/s');
INSERT INTO units VALUES ('308a5ac9-d208-416d-9cb7-db858ae8decf', '%.2f ⁰');
INSERT INTO units VALUES ('04ad5dac-452d-4386-9e93-e21b22be9405', '%.2f ng/m³');
INSERT INTO units VALUES ('07ef2978-86a1-423b-a225-b398111f89d7', '%.2f ppb');


--
-- Data for Name: parameters; Type: TABLE DATA; Schema: public; Owner: deepbreath-tst
--

INSERT INTO parameters VALUES ('9b6e19a2-3280-46b9-abc2-eb924ec08711', 'Pył zawieszony PM₁₀', 'pm10', '2015-11-13 16:09:17.787+01', '2015-11-13 16:09:17.787+01', NULL, 'abf353ee-741f-4886-8c83-022a5eefea46');
INSERT INTO parameters VALUES ('68caa307-e97d-484e-9963-1fd8f98b80c0', 'Pył zawieszony PM₂.₅', 'pm2.5', '2015-11-13 16:09:17.792+01', '2015-11-13 16:09:17.792+01', NULL, 'abf353ee-741f-4886-8c83-022a5eefea46');
INSERT INTO parameters VALUES ('bf7fd698-d592-4ac2-acf9-f4737f7192b9', 'Dwutlenek siarki SO₂', 'so2', '2015-11-13 16:09:17.793+01', '2015-11-13 16:09:17.793+01', NULL, 'abf353ee-741f-4886-8c83-022a5eefea46');
INSERT INTO parameters VALUES ('2d2f6901-b8e6-4bb4-9f63-acf75cd1db9b', 'Tlenek węgla CO', 'co', '2015-11-13 16:09:17.794+01', '2015-11-13 16:09:17.794+01', NULL, 'abf353ee-741f-4886-8c83-022a5eefea46');
INSERT INTO parameters VALUES ('abb71776-1c78-43c4-bf8e-82ac529944b0', 'Dwutlenek azotu NO₂', 'no2', '2015-11-13 16:09:17.795+01', '2015-11-13 16:09:17.795+01', NULL, 'abf353ee-741f-4886-8c83-022a5eefea46');
INSERT INTO parameters VALUES ('41be13c2-ca34-4785-a83e-4c0783443a02', 'Tlenki azotu NOₓ', 'nox', '2015-11-13 16:09:17.796+01', '2015-11-13 16:09:17.796+01', NULL, 'abf353ee-741f-4886-8c83-022a5eefea46');
INSERT INTO parameters VALUES ('422b3f09-a154-4af1-9dcc-396984b3eb37', 'Tlenek azotu NO', 'no', '2015-11-13 16:09:17.796+01', '2015-11-13 16:09:17.796+01', NULL, 'abf353ee-741f-4886-8c83-022a5eefea46');
INSERT INTO parameters VALUES ('596226b5-f5be-4e83-8a26-287f2bae4f4f', 'Ozon O₃', 'o3', '2015-11-13 16:09:17.798+01', '2015-11-13 16:09:17.798+01', NULL, 'abf353ee-741f-4886-8c83-022a5eefea46');
INSERT INTO parameters VALUES ('dc801a62-e926-4be3-90a4-9fc4cdc45350', 'Benzen C₆H₆', 'bzn', '2015-11-13 16:09:17.799+01', '2015-11-13 16:09:17.799+01', NULL, 'abf353ee-741f-4886-8c83-022a5eefea46');
INSERT INTO parameters VALUES ('8509272a-93b9-4038-b3cf-d81bea91e3bc', 'Temperatura', 'temp', '2015-11-13 16:09:17.849+01', '2015-11-13 16:09:17.849+01', NULL, '171604b3-e810-4a1b-8eb8-6a2b22f7a6bd');
INSERT INTO parameters VALUES ('36bf1b57-3371-48fb-91f6-240dd96a38b5', 'Ciśnienie atmosferyczne', 'press', '2015-11-13 16:09:17.865+01', '2015-11-13 16:09:17.865+01', NULL, '8ae383ef-722a-403f-8879-93baf669cd1f');
INSERT INTO parameters VALUES ('532bccee-c9e2-4827-b8e5-ba854c57700a', 'Wilgotność względna', 'humid', '2015-11-13 16:09:17.888+01', '2015-11-13 16:09:17.888+01', NULL, 'cc82a78e-8f55-4528-910f-718eedac4b50');
INSERT INTO parameters VALUES ('304c604c-3e22-4143-a45e-3172a9218e8b', 'Prędkość wiatru', 'ws', '2015-11-13 16:09:17.909+01', '2015-11-13 16:09:17.909+01', NULL, '6530a1a6-a3e1-42f0-9372-75d6e29be545');
INSERT INTO parameters VALUES ('45907284-5352-4347-b333-b61639054000', 'Kierunek wiatru', 'wd', '2015-11-13 16:09:17.933+01', '2015-11-13 16:09:17.933+01', NULL, '308a5ac9-d208-416d-9cb7-db858ae8decf');
INSERT INTO parameters VALUES ('78382bc0-fbdd-4134-abd6-d95db60dc132', 'Benzo(a)piren w PM₁₀', 'pm10_bap', '2015-11-13 16:09:17.95+01', '2015-11-13 16:09:17.95+01', NULL, '04ad5dac-452d-4386-9e93-e21b22be9405');
INSERT INTO parameters VALUES ('f208179f-848a-4c88-b968-50591b214a52', 'Arsen w PM₁₀', 'pm10_as', '2015-11-13 16:09:17.951+01', '2015-11-13 16:09:17.951+01', NULL, '04ad5dac-452d-4386-9e93-e21b22be9405');
INSERT INTO parameters VALUES ('a3ab8a84-dc4f-455c-8294-233e22fa1877', 'Kadm w PM₁₀', 'pm10_cd', '2015-11-13 16:09:17.952+01', '2015-11-13 16:09:17.952+01', NULL, '04ad5dac-452d-4386-9e93-e21b22be9405');
INSERT INTO parameters VALUES ('0737640a-27f1-49b1-a100-81ba09b9ad77', 'Nikiel w PM₁₀', 'pm10_ni', '2015-11-13 16:09:17.953+01', '2015-11-13 16:09:17.953+01', NULL, '04ad5dac-452d-4386-9e93-e21b22be9405');
INSERT INTO parameters VALUES ('c8d52e72-49f6-4403-9360-6d9996b0ecae', 'Ołów', 'pb', '2015-11-13 16:09:17.984+01', '2015-11-13 16:09:17.984+01', NULL, '07ef2978-86a1-423b-a225-b398111f89d7');

