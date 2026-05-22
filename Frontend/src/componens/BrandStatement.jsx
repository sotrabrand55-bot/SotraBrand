// eslint-disable-next-line no-unused-vars
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { mockBrandStatements, useMockData } from "../lib/mockData";
import { BrandStatementSkeleton, ShimmerImage } from "./Skeletons";

const getActiveStatement = (items) => {
  const list = Array.isArray(items) ? items : [items].filter(Boolean);
  return list
    .filter((item) => item?.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
};

const BrandStatement = () => {
  const { backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();
  const [statement, setStatement] = useState(getActiveStatement(mockBrandStatements));
  const [loading, setLoading] = useState(!useMockData);

  useEffect(() => {
    if (useMockData) {
      setStatement(getActiveStatement(mockBrandStatements));
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${backendUrl}/api/brand-statement`);
        const nextStatement =
          res.data?.statements ||
          res.data?.brandStatements ||
          res.data?.statement ||
          res.data?.brandStatement ||
          res.data;
        setStatement(getActiveStatement(nextStatement));
      } catch (_) {
        setStatement(getActiveStatement(mockBrandStatements));
      } finally {
        setLoading(false);
      }
    })();
  }, [backendUrl]);

  if (loading) return <BrandStatementSkeleton />;
  if (!statement) return null;

  const details = Array.isArray(statement.details) ? statement.details : [];

  return (
    <section
      className="
        -mx-4 sm:-mx-[5vw] md:-mx-[7vw] lg:-mx-[9vw]
        bg-[#fffaf4] py-10 sm:py-12 md:py-14
      "
    >
      <div className="mx-auto grid max-w-[1300px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
        <div className="max-w-2xl">
          <div className="mb-4 flex w-fit items-center gap-3 text-[#c49a5e]">
            <span className="h-px w-10 bg-current" />
            <span className="h-2.5 w-2.5 rotate-45 bg-current" />
            <span className="h-px w-10 bg-current" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a8068]">
            {statement.eyebrow}
          </p>

          <h2 className="mt-3 font-serif text-5xl leading-none text-[#1f1b17] sm:text-6xl">
            {statement.title}
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-[#7d6756] sm:text-lg">
            {statement.description}
          </p>

          <div className="mt-7 grid gap-3 text-sm text-[#6f5844] sm:grid-cols-2">
            {details.slice(0, 2).map((detail) => (
              <div key={detail.title} className="border-l border-[#c49a5e] pl-4">
                <p className="font-semibold uppercase tracking-[0.16em] text-[#1f1b17]">
                  {detail.title}
                </p>
                <p className="mt-1 leading-6">{detail.text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(statement.buttonLink || "/Collection")}
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#1f1b17] px-7 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#c49a5e]"
          >
            {statement.buttonText || "Explore More"}
            <FiArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div
          className="relative min-h-[420px] overflow-hidden rounded-md bg-[#eadfd2] bg-cover bg-center shadow-[0_24px_60px_rgba(62,45,28,0.14)] sm:min-h-[520px]"
          style={
            statement.image
              ? { backgroundImage: `url(${statement.image})` }
              : undefined
          }
        >
          <ShimmerImage
            src={statement.image}
            alt={statement.imageAlt || statement.title}
            className="absolute inset-0 h-full w-full object-cover"
            wrapperClassName="absolute inset-0 h-full w-full"
            skeletonClassName="bg-[#E9DFD3]"
            loading="lazy"
            draggable="false"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b778]">
              {statement.imageEyebrow}
            </p>
            <p className="mt-2 max-w-sm font-serif text-3xl leading-tight">
              {statement.imageTitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStatement;
