import { DistanceMatrixService } from "@react-google-maps/api";
import vehicleApi from "api/vehicleApi";
import ItemFind from "components/find/ItemFind";
import Loading from "components/layout/Loading";
import {
  formatDateTime,
  formatMoneyK,
  sortJSON,
  sortVehicle,
  sortVehicleRating,
} from "lib/Helper";
import React, { useEffect, useState } from "react";
import { Button, Col, Form, FormGroup, FormLabel, Row } from "react-bootstrap";
import FormRange from "react-bootstrap/esm/FormRange";
import "react-datepicker/dist/react-datepicker.css";
import { GrPowerReset } from "react-icons/gr";
import { useSelector } from "react-redux";

export default function FindPage() {
  const [resultSearch, setResultSearch] = useState([]);
  const [afterFilter, setAfterFilter] = useState([]);
  const [isFresh, setIsFresh] = useState(true);
  const [status, setStatus] = useState("loading");
  const [listLocationVehicle, setListLocationVehicle] = useState([]);
  const [listVehicle, setListVehicle] = useState([]);
  const [range, setRange] = useState(1000000);
  const handleRange = (evt) => {
    const value = evt.target.value;
    setRange(value);
    let list = [...resultSearch];
    list = list.filter((item) => {
      return item.vehicle.originPrice < value;
    });
    setAfterFilter(list);
  };
  const handleBikeType = (evt) => {
    const value = evt.target.value;
    let list = [...resultSearch];
    if (value !== "all") {
      list = list.filter((item) => {
        return item.vehicle.bikeType === value;
      });
    }
    setAfterFilter(list);
  };
  const handleCarType = (evt) => {
    const value = evt.target.value;
    let list = [...resultSearch];
    if (value !== "all") {
      list = list.filter((item) => {
        return item.vehicle.carType === +value;
      });
    }
    setAfterFilter(list);
  };
  const handleTransmission = (evt) => {
    const value = evt.target.value;
    let list = [...resultSearch];
    if (value !== "all") {
      list = list.filter((item) => {
        return item.vehicle.transmission === value;
      });
    }
    setAfterFilter(list);
  };

  // @ts-ignore
  const searchInput = useSelector((state) => state.searched).data;
  const handleSort = (evt) => {
    const type = evt.target.value;
    let list = [...afterFilter];
    switch (type) {
      case "1":
        list = sortJSON(list, "dis", true);
        break;
      case "2":
        list = sortVehicle(list, "originPrice", true);
        break;
      case "3":
        list = sortVehicle(list, "originPrice", false);
        break;
      case "4":
        list = sortVehicleRating(list, false);
      default:
        list = sortVehicle(list, "id", true);
        break;
    }
    setAfterFilter(list);
  };
  useEffect(() => {
    const runEffect = async () => {
      const list = await getListVehicles(searchInput.type);
      setListVehicle(list);
      setListLocationVehicle(getListLocation(list));
    };
    runEffect();
  }, []);
  const url = "#";
  return (
    <>
      {isFresh && searchInput?.startLocal !== "" && (
        <DistanceMatrixService
          options={{
            destinations: listLocationVehicle,
            origins: [searchInput.startLocal],
            travelMode: "DRIVING",
          }}
          callback={(response) => {
            if (response) {
              let rs = getListDistanceVehicles(response, listVehicle);
              setResultSearch(rs);
              setAfterFilter(rs);
              setIsFresh(false);
              setStatus("idle");
            }
          }}
        />
      )}
      <div id="find-page">
        <div className="find">
          <Row className="find__header">
            <Col className="find__header-location" lg={6} id="heading">
              <label htmlFor="">?????a ??i???m:</label>
              <p>{searchInput.startLocal}</p>
            </Col>
            <Col className="find__header-start" lg={3} id="heading">
              <label htmlFor="">B???t ?????u:</label>
              <div className="date-start" id="date">
                <p>{formatDateTime(searchInput.startDate, false)}</p>
              </div>
              <div className="time-start ms-3">
                <p>{searchInput.startTime}</p>
              </div>
            </Col>
            {searchInput.type === "driver" ? (
              <Col className="find__header-end" lg={3} id="heading">
                <label htmlFor="">Th???i gian:</label>
                <div className="date-end" id="date">
                  <p>{searchInput.time} Ti???ng</p>
                </div>
              </Col>
            ) : (
              <Col className="find__header-end" lg={3} id="heading">
                <label htmlFor="">K???t th??c:</label>
                <div className="date-end" id="date">
                  <p>{searchInput.startDate}</p>
                </div>
                <div className="time-end ms-3">
                  <p>{searchInput.startTime}</p>
                </div>
              </Col>
            )}
          </Row>
          <Row className="find__content">
            <Col className="find__content-options" lg={4}>
              <Form>
                <FormGroup id="group" className="mb-4">
                  <FormLabel id="lable">S???p x???p</FormLabel>
                  <select
                    className="form-select form-select-md mb-3"
                    defaultValue="T???i ??u"
                    onChange={handleSort}
                  >
                    <option value="0">T???i ??u</option>
                    <option value="1">??u ti??n kho???ng c??ch</option>
                    <option value="2">??u ti??n gi?? th???p</option>
                    <option value="3">??u ti??n gi?? cao</option>
                    <option value="4">??u ti??n ????nh gi??</option>
                  </select>
                </FormGroup>
                <FormGroup id="group" className="mb-4">
                  <FormLabel id="lable">M???c gi??</FormLabel>
                  <Form.Range
                    min="100000"
                    max="1500000"
                    step="100000"
                    onChange={handleRange}
                    defaultValue={range}
                    id="price-range"
                  />
                  <Form.Label className="form-label fw--3 fs--6 justify-content-end d-flex">
                    <span id="max-price">D?????i {formatMoneyK(range)}</span>
                  </Form.Label>
                </FormGroup>
                {searchInput.type === "bike" ? (
                  <FormGroup id="group" className="mb-4">
                    <FormLabel id="lable">Lo???i xe m??y</FormLabel>
                    <select
                      className="form-select form-select-md mb-3"
                      defaultValue="all"
                      onChange={handleBikeType}
                    >
                      <option value="all">T???t c???</option>
                      <option value="Xe s???">Xe s???</option>
                      <option value="Xe ga">Xe ga</option>
                      <option value="Xe c??n">Xe c??n</option>
                    </select>
                  </FormGroup>
                ) : (
                  <FormGroup id="group" className="mb-4">
                    <FormLabel id="lable">Lo???i xe ?? t??</FormLabel>
                    <select
                      className="form-select form-select-md mb-3"
                      defaultValue="all"
                      onChange={handleCarType}
                    >
                      <option value="all">T???t c???</option>
                      <option value="1">Mini (4 ch???)</option>
                      <option value="2">Sedan (4 ch???)</option>
                      <option value="3">Hatchback (4 ch???)</option>
                      <option value="4">G???m cao (5 ch???)</option>
                      <option value="5">G???m cao (7 ch???)</option>
                      <option value="6">G???m th???p (7 ch???)</option>
                      <option value="7">B??n t???i</option>
                    </select>
                  </FormGroup>
                )}
                {searchInput.type === "bike" ? null : (
                  <FormGroup id="group" className="mb-4">
                    <FormLabel id="lable">Truy???n ?????ng</FormLabel>
                    <select
                      className="form-select form-select-md mb-3"
                      defaultValue="all"
                      onChange={handleTransmission}
                    >
                      <option value="all">T???t c???</option>
                      <option value="S??? s??n">S??? s??n</option>
                      <option value="T??? ?????ng">S??? t??? ?????ng</option>
                    </select>
                  </FormGroup>
                )}
                <FormGroup
                  id="group"
                  className="mb-4"
                  style={{ textAlign: "right", color: "#00a54f" }}
                ></FormGroup>
                <Button
                  type="reset"
                  className="w-100"
                  onClick={() => {
                    setAfterFilter(resultSearch);
                  }}
                >
                  {" "}
                  <span id="icon-reset">
                    <GrPowerReset style={{ color: "#00a54f" }} />
                  </span>
                  B??? l???c
                </Button>
              </Form>
            </Col>
            <Col className="find__content-items" lg={8}>
              <Row className="items position-relative">
                {status === "loading" ? (
                  <Loading type="inline" />
                ) : afterFilter.length > 0 ? (
                  afterFilter.map((item, index) => {
                    return (
                      <ItemFind
                        key={index}
                        data={item}
                        type={searchInput.type}
                      />
                    );
                  })
                ) : (
                  <p className="text-center mt-5 text-danger">
                    Kh??ng t??m th???y k???t qu???!
                  </p>
                )}
              </Row>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}

async function getListVehicles(type) {
  let listVehicle = [];
  switch (type) {
    case "car":
      // @ts-ignore
      listVehicle = await vehicleApi.getCarSelfDriver();
      break;
    case "driver":
      // @ts-ignore
      listVehicle = await vehicleApi.getCarDriver();
      break;
    case "bike":
      // @ts-ignore
      listVehicle = await vehicleApi.getBikes();
      break;
  }
  return listVehicle;
}
function getListLocation(list) {
  let rsLatLng = [];
  if (list.length > 0) {
    list.forEach((e) => {
      let item = e.location.strAddress;
      rsLatLng.push(item);
    });
  }
  return rsLatLng;
}
function getListDistanceVehicles(response, listVehicles) {
  let list = [];
  let desList = response.destinationAddresses;
  let oriList = response.originAddresses;
  let num = desList.length;
  let rowList = response.rows[0].elements;
  for (let i = 0; i < num; i++) {
    if (rowList[i].distance) {
    }
    if (rowList[i].distance && rowList[i].distance.value < 20000) {
      let item = {
        id: i,
        des: desList[i],
        ori: oriList[0],
        dis: rowList[i].distance.text,
        dur: rowList[i].duration.text,
        vehicle: listVehicles[i],
      };
      list.push(item);
    }
  }
  return list;
}
