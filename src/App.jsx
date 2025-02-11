import { useState, useEffect, useRef } from "react";
import { get, set, useForm } from "react-hook-form";
import ReactLoading from "react-loading";
import axios from "axios";

function App() {
  const [isPartLoading, setIsPartLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productCount, setProductCount] = useState(1);
  const [productModal, setProductsModal] = useState({});
  const [cartInfos, setCartInfos] = useState([]);
  const API_BASE = "https://ec-course-api.hexschool.io/v2/api";
  const API_PATH = "wei777";

  useEffect(() => {
    getProducts();
    getCart();
  }, []);
  // react hook form
  const {
    register, // 用來註冊表單元素
    handleSubmit, // 用來處理表單提交
    formState: { errors }, // 用來顯示錯誤訊息
    reset, // 用來重置表單
  } = useForm({
    mode: "onChange",
    // 使用參數 defaultValues
    defaultValues: {
      name: "aaa",
      email: "aaa@email.com",
      tel: "0938593729",
      address: "dfdshui",
      comment: "",
    },
  });
  const onSubmit = (data) => {
    // 表單送出實際的資料內容
    if (cartInfos.carts.length < 1) {
      alert("請加入商品到購物車");
      return;
    }
    createOrder(data);

    setIsLoading(true);
    // setTimeout
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  const getProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/${API_PATH}/products`);
      setProducts(response.data.products);
    } catch (error) {
      console.error("取得產品失敗", error);
    } finally {
      setIsLoading(false);
    }
  };
  const addProductToCart = async (product_id, qty) => {
    setIsPartLoading(true);
    try {
      const API_URL = "https://ec-course-api.hexschool.io/v2/api/wei777/cart";
      // const API_URL = `${API_BASE}/${API_PATH}/cart/${cart.id}`;
      const postData = {
        data: {
          product_id,
          qty,
        },
      };

      await axios.post(API_URL, postData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      getCart();
    } catch (error) {
      console.error("加入購物車失敗", error);
    } finally {
      setIsPartLoading(false);
    }
  };
  const updateProductToCart = async (cartProduct_id, cartProductCount) => {
    setIsPartLoading(true);
    try {
      await axios.put(
        `https://ec-course-api.hexschool.io/v2/api/wei777/cart/${cartProduct_id}`,
        {
          data: {
            product_id: cartProduct_id,
            qty: cartProductCount,
          },
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      console.log("更新購物車成功");
      getCart();
    } catch (error) {
      console.error("更新購物車失敗", error);
    } finally {
      setIsPartLoading(false);
    }
  };
  const getCart = () => {
    axios
      .get("https://ec-course-api.hexschool.io/v2/api/wei777/cart")
      .then((res) => {
        // console.log("cart", res.data.data);
        setCartInfos(res.data.data);
      });
  };
  const deleteOneFromCart = async (cartProduct_id) => {
    setIsLoading(true);
    try {
      await axios.delete(
        `https://ec-course-api.hexschool.io/v2/api/wei777/cart/${cartProduct_id}`
      );
      await getCart();
    } catch (error) {
      console.error("刪除失敗", error);
    } finally {
      setIsLoading(false);
    }
  };
  const deleteAllFromCart = async () => {
    setIsLoading(true);
    try {
      await axios.delete(
        "https://ec-course-api.hexschool.io/v2/api/wei777/carts",
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      console.log("刪除成功");
      getCart();
    } catch (error) {
      console.error("刪除失敗", error);
    } finally {
      setIsLoading(false);
    }
  };
  const createOrder = async (data) => {
    setIsLoading(true);
    try {
      const formData = {
        data: {
          user: {
            name: data.name,
            email: data.email,
            tel: data.tel,
            address: data.address,
          },
          message: data.comment,
        },
      };
      const API_URL = "https://ec-course-api.hexschool.io/v2/api/wei777/order";
      const response = await axios.post(API_URL, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      console.log("訂單建立成功", response.data);
      getCart();
      reset();
    } catch (error) {
      console.error("訂單建立失敗", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div id="app">
      <div className="container">
        <div className="mt-4">
          {/* 產品Modal */}
          <div
            className="modal fade"
            id="productModal"
            tabIndex="-1"
            aria-labelledby="productModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog" key={productModal.id}>
              <div className="modal-content">
                {/* title */}
                <div className="modal-header">
                  <h5 className="modal-title" id="productModalLabel">
                    產品名稱: {productModal.title}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body text-start">
                  <img src={productModal.imageUrl} alt="" />
                  <p>內容: {productModal.content}</p>
                  <p>描述: {productModal.description}</p>
                  <p>
                    價錢 : <del>原價 ${productModal.origin_price}</del>， 特價 :{" "}
                    {productModal.price}元
                  </p>

                  <div className="d-flex align-items-center">
                    <label htmlFor="">購買數量:</label>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        if (productCount <= 1) return;
                        setProductCount((productCount) => productCount - 1);
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      name=""
                      id=""
                      min="1"
                      max="10"
                      value={productCount}
                      onChange={(e) => {
                        setProductCount(e.target.value);
                      }}
                      className="form-control"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setProductCount((productCount) => productCount + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* add to cart btn */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary d-flex"
                    onClick={() => {
                      const productFoundInTheCart = cartInfos.carts.find(
                        (cartProduct) => {
                          return cartProduct.product.id === productModal.id;
                        }
                      );
                      if (productFoundInTheCart !== undefined) {
                        updateProductToCart(
                          productFoundInTheCart.id,
                          productCount + 1
                        );
                      } else {
                        addProductToCart(productModal.id, 1);
                      }
                    }}
                  >
                    <div>加入購物車</div>
                    {isPartLoading && (
                      <ReactLoading
                        type={"spin"}
                        color={"#000"}
                        height={"1.5rem"}
                        width={"1.5rem"}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* 產品Modal */}
          <table className="table align-middle">
            <thead>
              <tr>
                <th>圖片</th>
                <th>商品名稱</th>
                <th>價格</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                return (
                  <tr key={product.id}>
                    {/* imgae */}
                    <td style={{ width: "200px" }}>
                      <div
                        style={{
                          height: "100px",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundImage: `url(${product.imageUrl})`,
                        }}
                      ></div>
                    </td>
                    {/* product title */}
                    <td>{product.title}</td>
                    {/* price */}
                    <td>
                      <div className="h5">{product.price} 元</div>
                      <del className="h6">原價 {product.origin_price} 元</del>
                      <div className="h5"></div>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          data-bs-toggle="modal"
                          data-bs-target="#productModal"
                          onClick={() => {
                            console.log("product.id", product);
                            setProductsModal(product);
                          }}
                        >
                          <div>查看更多</div>
                          {isPartLoading && (
                            <ReactLoading
                              type={"spin"}
                              color={"#000"}
                              height={"1.5rem"}
                              width={"1.5rem"}
                            />
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => {
                            const productFoundInTheCart = cartInfos.carts.find(
                              (cartProduct) => {
                                return cartProduct.product.id === product.id;
                              }
                            );
                            if (productFoundInTheCart !== undefined) {
                              updateProductToCart(
                                productFoundInTheCart.id,
                                productFoundInTheCart.qty + 1
                              );
                            } else {
                              addProductToCart(product.id, 1);
                            }
                          }}
                        >
                          <div>加到購物車</div>
                          {isPartLoading && (
                            <ReactLoading
                              type={"spin"}
                              color={"#000"}
                              height={"1.5rem"}
                              width={"1.5rem"}
                            />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="text-end">
            <button
              className="btn btn-outline-danger"
              type="button"
              onClick={() => {
                deleteAllFromCart();
              }}
            >
              清空購物車
            </button>
          </div>
          <table className="table align-middle">
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th>品名</th>
                <th style={{ width: "150px" }}>數量/單位</th>
                <th>單價</th>
              </tr>
            </thead>
            <tbody>
              {/* Cart rows here */}
              {cartInfos &&
                cartInfos?.carts?.map((cartProduct) => {
                  {
                    /* console.log("cartProduct", cartProduct); */
                  }
                  return (
                    <tr key={cartProduct.product.id} className="">
                      <td>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => {
                            deleteOneFromCart(cartProduct.id);
                          }}
                        >
                          刪除
                        </button>
                      </td>
                      <td>
                        <img
                          src={cartProduct.product.imageUrl}
                          alt=""
                          style={{ width: "100px" }}
                        />
                      </td>
                      <td>{cartProduct.product.title}</td>
                      <td style={{ width: "150px" }}>
                        {/* update cart */}
                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              updateProductToCart(
                                cartProduct.id,
                                cartProduct.qty - 1
                              );
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            name=""
                            id=""
                            min="1"
                            max="10"
                            value={cartProduct.qty}
                            onChange={(e) => {
                              updateProductToCart(
                                cartProduct.id,
                                e.target.value * 1
                              );
                            }}
                            className="form-control"
                          />
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              updateProductToCart(
                                cartProduct.id,
                                cartProduct.qty + 1
                              );
                            }}
                          >
                            +
                          </button>
                        </div>
                        {cartProduct.product.unit}
                      </td>
                      <td>{cartProduct.total}</td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end">
                  總計 {cartInfos.final_total}
                </td>
                <td className="text-end"></td>
              </tr>
              <tr>
                <td colSpan="3" className="text-end text-success">
                  折扣價
                </td>
                <td className="text-end text-success"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* order form */}
        <div className="my-5 row justify-content-center">
          <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
            {/* email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="請輸入 Email"
                {...register("email", {
                  required: "必填",
                  // regx
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email 格式不正確",
                  },
                })}
              />
              {errors.email && (
                <p className="text-danger">{errors.email.message}</p>
              )}
              {/* <p className="text-danger">{errors?.email?.message}</p> */}
            </div>
            {/* name */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                收件人姓名
              </label>
              <input
                id="name"
                name="姓名"
                type="text"
                className="form-control"
                placeholder="請輸入姓名"
                {...register("name", {
                  required: "必填",
                })}
              />
              {errors.name && (
                <p className="text-danger">{errors.name.message}</p>
              )}
            </div>
            {/* phone */}
            <div className="mb-3">
              <label htmlFor="tel" className="form-label">
                收件人電話
              </label>
              <input
                id="tel"
                name="電話"
                type="tel"
                className="form-control"
                placeholder="請輸入電話"
                {...register("tel", {
                  required: "必填",
                  pattern: {
                    value: /^\d{8,15}$/,
                    message: "電話號碼格式不正確",
                  },
                })}
              />
              {errors.tel && (
                <p className="text-danger">{errors.tel.message}</p>
              )}
            </div>
            {/* address */}
            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                收件人地址
              </label>
              <input
                id="address"
                name="地址"
                type="text"
                className="form-control"
                placeholder="請輸入地址"
                {...register("address", {
                  required: "必填",
                })}
              />
              {errors.address && (
                <p className="text-danger">{errors.address.message}</p>
              )}
            </div>
            {/* comment */}
            <div className="mb-3">
              <label htmlFor="message" className="form-label">
                留言
              </label>
              <textarea
                id="message"
                className="form-control"
                cols="30"
                rows="10"
                {...register("comment")}
              ></textarea>
            </div>
            {/* submit btn */}
            <div className="text-end">
              <button
                type="submit"
                className="btn btn-danger align-items-center"
              >
                送出訂單
              </button>
            </div>
          </form>
        </div>
      </div>
      {isLoading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(255,255,255,0.3)",
            zIndex: 99911,
          }}
        >
          <ReactLoading
            type={"spin"}
            color={"#000"}
            height={"1.5rem"}
            width={"1.5rem"}
          />
        </div>
      )}
    </div>
  );
}

export default App;
