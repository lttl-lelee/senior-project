import { FormGroup } from "@material-ui/core";
import React, { useState } from "react";
import {
  Button,
  Col,
  Form,
  FormLabel,
  InputGroup,
  Modal,
  Row,
} from "react-bootstrap";
import HeaderVehicle from "./HeaderVehicle";
import {
  changeEndDate,
  changeEndTime,
  changeStartDate,
  changeStartTime,
} from "app/slice/searchSlice";
import { useSelector } from "react-redux";
import store from "app/store";
import { calcTotalDate, comma, dateTimeToLong, formatMoneyK } from "lib/Helper";
import { AiOutlineFileProtect } from "react-icons/ai";
import { GrLocation } from "react-icons/gr";
import { showLogin } from "app/slice/userSlice";
import PromotionForm from "./PromotionForm";
import { BsArrowLeftShort } from "react-icons/bs";
import userApi from "api/userApi";
import bookingApi from "api/bookingApi";
import { NOTI } from "constants/index";
import { store as noti } from "react-notifications-component";

function NoDriverSideBar(props) {
  const vehicle = props.vehicle;
  const searched = useSelector((state) => state.searched).data;
  const date = calcTotalDate(searched);
  const logged = useSelector((state) => state.logged);
  const booking = useSelector((state) => state.booking);
  const total = vehicle.originPrice + (vehicle.originPrice * 10) / 100;
  const discount = booking.data.promotion ? booking.data.promotion.discount : 0;
  const totalWithDiscount =
    total * date - Math.round((total * date * discount) / 100000) * 1000;

  const [openModal, setOpenModel] = useState(false);
  const [method, setMethod] = useState(1);
  const handleCloseModal = () => {
    setOpenModel(false);
  };
  const handleChangeEndDate = (evt) => {
    store.dispatch(changeEndDate(evt.target.value));
  };
  const handleChangeEndTime = (evt) => {
    store.dispatch(changeEndTime(evt.target.value));
  };
  const handleChangeStartDate = (evt) => {
    store.dispatch(changeStartDate(evt.target.value));
  };
  const handleChangeStartTime = (evt) => {
    store.dispatch(changeStartTime(evt.target.value));
  };
  const handleSubmit = () => {
    if (logged.data) {
      const permission = vehicle.bikeType ? 1 : 2;
      bookingApi.checkGPLX({ permission }).then((res) => {
        if (res) {
          bookingApi
            .createBooking({
              startTime: dateTimeToLong(searched.startDate, searched.startTime),
              endTime: dateTimeToLong(searched.endDate, searched.endTime),
              amount: totalWithDiscount,
              promotion: booking.data.promotion,
              vehicleId: vehicle.id,
              paymentMethod: method,
            })
            .then((res) => {
              props.history.push("/booking?id=" + res.id);
            });
          noti.addNotification({
            ...NOTI,
            title: "Đặt xe thành công",
            message: "Bạn đã đặt xe thành công, vui lòng chờ chủ xe xác nhận",
            type: "success",
            dismiss: {
              duration: 2000,
            },
          });
        } else {
          noti.addNotification({
            ...NOTI,
            title: "GPLX không đủ yêu cầu",
            message: "Vui lòng vào cài đặt tài khoản cập nhật GPLX của bạn",
            type: "warning",
            dismiss: {
              duration: 2000,
            },
          });
        }
      });
    } else {
      store.dispatch(showLogin());
    }
  };
  const handleCreateBooking = () => {};
  return (
    <Form id="sidebar">
      <div className="price-vehicle mb-3">
        <HeaderVehicle
          vehicle={vehicle}
          className="d-block d-lg-none text-start"
        />
        <div>
          <span className="price">{formatMoneyK(vehicle.originPrice)}</span>
          <span className="unit">/ngày</span>
        </div>
      </div>
      <FormGroup className="mb-3">
        <FormLabel className="lable-form">Ngày bắt đầu</FormLabel>
        <Row id="date-time">
          <Col xs={6} className="p-0">
            <Form.Control
              className="findCarFormInput"
              type="date"
              name="startDate"
              value={searched.startDate}
              onChange={handleChangeStartDate}
            />
          </Col>
          <Col xs={6} className="pe-0">
            <Form.Control
              className="findCarFormInput"
              type="time"
              name="startTime"
              value={searched.startTime}
              onChange={handleChangeStartTime}
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup className="mb-3">
        <FormLabel className="lable-form">Ngày kết thúc</FormLabel>
        <Row id="date-time">
          <Col xs={6} className="p-0">
            <Form.Control
              className="findCarFormInput"
              type="date"
              name="startDate"
              value={searched.endDate}
              onChange={handleChangeEndDate}
            />
          </Col>
          <Col xs={6} className="pe-0">
            <Form.Control
              className="findCarFormInput"
              type="time"
              name="endTime"
              value={searched.endTime}
              onChange={handleChangeEndTime}
            />
          </Col>
        </Row>
      </FormGroup>
      {vehicle.deliveryEnable ? (
        <div id="line-form" className="mb-3">
          <div id="line-item">
            <span>Dịch vụ giao xe tận nơi</span>
            <span>{vehicle.deliveryRadius} km</span>
          </div>
          <div id="line-item">
            <span>Miễn phí giao xe</span>
            <span>{vehicle.deliveryRadiusFree} km</span>
          </div>
          <div id="line-item">
            <span>Phí giao nhận xe (2 chiều)</span>
            <span>{formatMoneyK(vehicle.deliveryFee)}/km</span>
          </div>
        </div>
      ) : null}
      <FormGroup className="mb-3">
        <FormLabel className="lable-form">Giới hạn số km</FormLabel>
        <span>
          Tối đa <span className="line-bold">{vehicle.limitDistance}</span>{" "}
          km/ngày. Phí{" "}
          <span className="line-bold">{formatMoneyK(vehicle.outLimitFee)}</span>
          /km vượt quá giới hạn.
        </span>
      </FormGroup>
      <FormGroup className="mb-3">
        <FormLabel className="lable-form">Bảo hiểm</FormLabel>
        <a href="" className="line-insur">
          <span>
            <AiOutlineFileProtect /> Chuyến đi được bảo hiểm bởi Pjico{" "}
          </span>
        </a>
        <a href="">Tìm hiểu thêm</a>
      </FormGroup>
      <FormGroup className="mb-3">
        <FormLabel className="lable-form">Chi tiết giá</FormLabel>
        <div className="bill">
          <div className="bill-item">
            <span>Đơn giá thuê</span>
            <span>{comma(vehicle.originPrice)}₫ / ngày</span>
          </div>
          <div className="bill-item">
            <span>Phí dịch vụ</span>
            <span>{comma((vehicle.originPrice * 5) / 100)}₫ / ngày</span>
          </div>
          <div className="bill-item">
            <span>Phí bảo hiểm</span>
            <span>{comma((vehicle.originPrice * 5) / 100)}₫ / ngày</span>
          </div>
          <div className="bill-item" id="total">
            <span>Tổng phí thuê xe</span>
            <span>
              {comma(total)}₫ x <span className="line-bold">{date}</span>
            </span>
          </div>
          <div className="bill-item">
            <span className="line-bold">Tổng cộng</span>
            <span className="line-bold">
              {comma(totalWithDiscount)}₫
              {totalWithDiscount < total * date ? (
                <>
                  {" "}
                  {<BsArrowLeftShort />}{" "}
                  <span className="text-decoration-line-through">
                    {comma(total * date)}₫
                  </span>
                </>
              ) : null}
            </span>
          </div>
          <br />
          {logged.data ? (
            <Row className="mb-3 order-1 position-relative">
              <PromotionForm />
            </Row>
          ) : null}
          <Button className="mt-5" onClick={handleSubmit}>
            Đặt xe
          </Button>
        </div>
      </FormGroup>
      
    </Form>
  );
}

export default React.memo(NoDriverSideBar);
